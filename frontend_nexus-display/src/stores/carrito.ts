import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Pantalla } from '@/models/pantalla'
import type { TipoPago } from '@/models/venta'

export interface ArticuloCarrito {
  pantalla: Pantalla
  cantidad: number
}

export interface ResultadoCantidad {
  ok: boolean
  motivo?: 'SIN_STOCK' | 'LIMITE'
  disponible?: number
}

interface EstadoGuardado {
  articulos: ArticuloCarrito[]
  idAlmacen: number | null
  tipoPago: TipoPago
  nombreCliente: string
  documentoCliente: string
}

const CLAVE_ALMACENAMIENTO = 'nexus.carrito.v1'
// Tope de unidades por artículo para que un carrito guardado no traiga valores raros.
const CANTIDAD_MAXIMA_POR_ARTICULO = 999
const TIPOS_PAGO: TipoPago[] = ['EFECTIVO', 'QR / YAPE', 'TRANSFERENCIA BANCARIA', 'TARJETA']

/**
 * Paso los métodos de pago viejos a los nombres nuevos ("QR" -> "QR / YAPE",
 * etc.) para que no se rompa un carrito que ya estaba guardado en el navegador.
 */
function normalizarTipoPago(valor: unknown): TipoPago {
  if (valor === 'QR') return 'QR / YAPE'
  if (valor === 'TRANSFERENCIA') return 'TRANSFERENCIA BANCARIA'
  return TIPOS_PAGO.includes(valor as TipoPago) ? (valor as TipoPago) : 'TRANSFERENCIA BANCARIA'
}

/**
 * Leo el carrito guardado en localStorage y reviso que los datos tengan
 * sentido antes de usarlos. Si algo está mal devuelvo null y empiezo con el
 * carrito vacío, en vez de que la página falle.
 */
function cargarEstado(): EstadoGuardado | null {
  try {
    const crudo = localStorage.getItem(CLAVE_ALMACENAMIENTO)
    if (!crudo) return null

    const datos = JSON.parse(crudo) as Partial<EstadoGuardado> & { metodoPago?: unknown }
    const articulos = Array.isArray(datos.articulos)
      ? datos.articulos
          .filter(
            (articulo) =>
              articulo &&
              typeof articulo.pantalla?.id === 'number' &&
              typeof articulo.cantidad === 'number' &&
              Number.isFinite(articulo.cantidad),
          )
          .map((articulo) => ({
            pantalla: articulo.pantalla,
            cantidad: Math.min(Math.max(1, Math.trunc(articulo.cantidad)), CANTIDAD_MAXIMA_POR_ARTICULO),
          }))
      : []

    return {
      articulos,
      idAlmacen: typeof datos.idAlmacen === 'number' ? datos.idAlmacen : null,
      tipoPago: normalizarTipoPago(datos.tipoPago ?? datos.metodoPago),
      nombreCliente: typeof datos.nombreCliente === 'string' ? datos.nombreCliente : '',
      documentoCliente: typeof datos.documentoCliente === 'string' ? datos.documentoCliente : '',
    }
  } catch {
    return null
  }
}

function stockTotalPantalla(pantalla: Pantalla): number {
  return (pantalla.inventarios ?? []).reduce((acc, inv) => acc + Number(inv.cantidad || 0), 0)
}

function stockPorAlmacen(pantalla: Pantalla, idAlmacen: number | null): number {
  if (!idAlmacen) return stockTotalPantalla(pantalla)
  const inventario = (pantalla.inventarios ?? []).find((inv) => Number(inv.idAlmacen) === idAlmacen)
  return Number(inventario?.cantidad ?? 0)
}

export const useCarritoStore = defineStore('carrito', () => {
  const guardado = cargarEstado()

  const articulos = ref<ArticuloCarrito[]>(guardado?.articulos ?? [])
  const idAlmacen = ref<number | null>(guardado?.idAlmacen ?? null)
  const tipoPago = ref<TipoPago>(guardado?.tipoPago ?? 'TRANSFERENCIA BANCARIA')
  const nombreCliente = ref(guardado?.nombreCliente ?? '')
  const documentoCliente = ref(guardado?.documentoCliente ?? '')

  const abierto = ref(false)
  const cargando = ref(false)
  const catalogoVersion = ref(0)
  const pendienteCheckout = ref(false)

  const unidades = computed(() => articulos.value.reduce((acc, articulo) => acc + articulo.cantidad, 0))
  const total = computed(() =>
    articulos.value.reduce(
      (acc, articulo) => acc + articulo.cantidad * Number(articulo.pantalla.precioVenta || 0),
      0,
    ),
  )
  const vacio = computed(() => articulos.value.length === 0)

  /** Guardo el carrito en localStorage para que no se pierda al recargar o al registrarse. */
  function guardar() {
    try {
      const estado: EstadoGuardado = {
        articulos: articulos.value,
        idAlmacen: idAlmacen.value,
        tipoPago: tipoPago.value,
        nombreCliente: nombreCliente.value,
        documentoCliente: documentoCliente.value,
      }
      localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(estado))
    } catch {
      // Si el almacenamiento está lleno o bloqueado, el carrito sigue en memoria.
    }
  }

  watch([articulos, idAlmacen, tipoPago, nombreCliente, documentoCliente], guardar, { deep: true })

  function abrir() {
    abierto.value = true
  }

  function cerrar() {
    abierto.value = false
  }

  function disponible(pantalla: Pantalla): number {
    return stockPorAlmacen(pantalla, idAlmacen.value)
  }

  function stockEnAlmacen(pantalla: Pantalla, id: number | null): number {
    return stockPorAlmacen(pantalla, id)
  }

  /**
   * Agrega un producto al carrito controlando el stock de la sucursal.
   * Devuelvo un objeto con ok/motivo/disponible para que la vista pueda avisar
   * si no hay stock o si ya llegó al máximo, sin lanzar una excepción.
   */
  function agregar(pantalla: Pantalla, cantidad = 1): ResultadoCantidad {
    const limite = disponible(pantalla)
    if (limite <= 0) return { ok: false, motivo: 'SIN_STOCK', disponible: 0 }

    const existente = articulos.value.find((articulo) => articulo.pantalla.id === pantalla.id)
    const cantidadSolicitada = Math.max(1, Math.trunc(cantidad))

    if (existente) {
      if (existente.cantidad + cantidadSolicitada > limite) {
        return { ok: false, motivo: 'LIMITE', disponible: limite }
      }
      existente.cantidad += cantidadSolicitada
      existente.pantalla = pantalla
      return { ok: true, disponible: limite }
    }

    if (cantidadSolicitada > limite) {
      return { ok: false, motivo: 'LIMITE', disponible: limite }
    }

    articulos.value.push({ pantalla, cantidad: cantidadSolicitada })
    return { ok: true, disponible: limite }
  }

  /**
   * Suma o resta unidades de un producto. No dejo bajar de 1 ni pasar el stock
   * que hay en la sucursal elegida.
   */
  function cambiarCantidad(idPantalla: number, delta: number): ResultadoCantidad {
    const articulo = articulos.value.find((i) => i.pantalla.id === idPantalla)
    if (!articulo) return { ok: false }

    const limite = disponible(articulo.pantalla)
    const nueva = articulo.cantidad + delta

    if (nueva < 1) return { ok: false }
    if (nueva > limite) return { ok: false, motivo: 'LIMITE', disponible: limite }

    articulo.cantidad = nueva
    return { ok: true, disponible: limite }
  }

  function quitar(idPantalla: number) {
    articulos.value = articulos.value.filter((articulo) => articulo.pantalla.id !== idPantalla)
  }

  function vaciar() {
    articulos.value = []
    pendienteCheckout.value = false
  }

  /** Cambia la sucursal y ajusta cantidades a su stock real. */
  function seleccionarAlmacen(id: number | null): string[] {
    idAlmacen.value = id
    if (tipoPago.value === 'EFECTIVO' && !id) {
      tipoPago.value = 'TRANSFERENCIA BANCARIA'
    }

    if (!id) return []

    const avisos: string[] = []
    articulos.value.forEach((articulo) => {
      const limite = stockPorAlmacen(articulo.pantalla, id)
      if (limite === 0) {
        avisos.push(`${articulo.pantalla.nombre}: sin stock en esta sucursal`)
      } else if (articulo.cantidad > limite) {
        articulo.cantidad = limite
        avisos.push(`${articulo.pantalla.nombre}: ajustado a ${limite} unidad(es)`)
      }
    })
    return avisos
  }

  /** Refresca los datos de stock de los productos guardados en el carrito. */
  function sincronizarProductos(catalogo: Pantalla[]): string[] {
    const porId = new Map(catalogo.map((pantalla) => [pantalla.id, pantalla]))
    const descartados: string[] = []
    const actualizados: ArticuloCarrito[] = []

    articulos.value.forEach((articulo) => {
      const fresco = porId.get(articulo.pantalla.id)
      if (!fresco) {
        descartados.push(articulo.pantalla.nombre)
        return
      }

      const limite = stockPorAlmacen(fresco, idAlmacen.value)
      const cantidad = Math.max(1, Math.min(articulo.cantidad, limite > 0 ? limite : articulo.cantidad))
      actualizados.push({ pantalla: fresco, cantidad })
    })

    articulos.value = actualizados
    return descartados
  }

  /** Indica si el producto del carrito no tiene stock en la sucursal elegida. */
  function sinStockEnSucursal(articulo: ArticuloCarrito): boolean {
    return Boolean(idAlmacen.value) && disponible(articulo.pantalla) === 0
  }

  function notificarCambioCatalogo() {
    catalogoVersion.value += 1
  }

  return {
    articulos,
    idAlmacen,
    tipoPago,
    nombreCliente,
    documentoCliente,
    abierto,
    cargando,
    catalogoVersion,
    pendienteCheckout,
    unidades,
    total,
    vacio,
    abrir,
    cerrar,
    disponible,
    stockEnAlmacen,
    agregar,
    cambiarCantidad,
    quitar,
    vaciar,
    seleccionarAlmacen,
    sincronizarProductos,
    sinStockEnSucursal,
    notificarCambioCatalogo,
  }
})
