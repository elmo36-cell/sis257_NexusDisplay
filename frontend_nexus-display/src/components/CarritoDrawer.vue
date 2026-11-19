<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Drawer from 'primevue/drawer'
import clienteApi from '@/plugins/axios'
import { useSesionStore } from '@/stores'
import { useCarritoStore, type ArticuloCarrito } from '@/stores/carrito'
import { formatearMoneda } from '@/helpers'
import { generarPatronQr } from '@/helpers/qr'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { OPCIONES_TRANSFERENCIA, QR_PAGO } from '@/config/pagos'
import type { Almacen } from '@/models/almacen'
import type { Pantalla } from '@/models/pantalla'
import type { TipoPago } from '@/models/venta'

const carrito = useCarritoStore()
const sesion = useSesionStore()
const router = useRouter()

const almacenes = ref<Almacen[]>([])
const preparando = ref(false)

const opcionTransferencia = ref(OPCIONES_TRANSFERENCIA[0]?.id ?? '')
const qrPagado = ref(false)
const efectivoRecibido = ref<number | null>(null)

const visible = computed({
  get: () => carrito.abierto,
  set: (valor: boolean) => (valor ? carrito.abrir() : carrito.cerrar()),
})

const metodos: { valor: TipoPago; etiqueta: string; icono: string }[] = [
  { valor: 'TRANSFERENCIA BANCARIA', etiqueta: 'Transferencia', icono: 'pi pi-building-columns' },
  { valor: 'QR / YAPE', etiqueta: 'QR / Yape', icono: 'pi pi-qrcode' },
  { valor: 'EFECTIVO', etiqueta: 'Efectivo', icono: 'pi pi-money-bill' },
]

const metodosDisponibles = computed(() =>
  metodos.filter((metodo) => metodo.valor !== 'EFECTIVO' || Boolean(carrito.idAlmacen)),
)

const almacenSeleccionado = computed({
  get: () => (carrito.idAlmacen ? String(carrito.idAlmacen) : ''),
  set: (valor: string) => {
    const avisos = carrito.seleccionarAlmacen(valor ? Number(valor) : null)
    if (avisos.length) notify.warn(avisos.join(' · '))
  },
})

const nombreAlmacen = computed(
  () => almacenes.value.find((almacen) => almacen.id === carrito.idAlmacen)?.nombre ?? '',
)

const transferenciaSeleccionada = computed(
  () =>
    OPCIONES_TRANSFERENCIA.find((opcion) => opcion.id === opcionTransferencia.value) ??
    OPCIONES_TRANSFERENCIA[0],
)

const etiquetaPago = computed(
  () => metodos.find((metodo) => metodo.valor === carrito.tipoPago)?.etiqueta ?? '',
)

/** Solo un usuario registrado (con sesión) puede acceder al pago. */
const estaRegistrado = computed(() => sesion.estaAutenticado)

const haySinStock = computed(() => carrito.articulos.some((articulo) => carrito.sinStockEnSucursal(articulo)))

const cambio = computed(() => {
  const recibido = Number(efectivoRecibido.value ?? 0)
  return recibido > carrito.total ? Number((recibido - carrito.total).toFixed(2)) : 0
})

const faltanteEfectivo = computed(() => {
  if (carrito.tipoPago !== 'EFECTIVO') return 0
  const recibido = Number(efectivoRecibido.value ?? 0)
  return recibido < carrito.total ? Number((carrito.total - recibido).toFixed(2)) : 0
})

/**
 * Habilita el botón de confirmar: tiene que haber productos, stock, el QR
 * confirmado (si paga por QR) y el efectivo suficiente (si paga en efectivo).
 * Si el visitante no está registrado lo dejo pasar igual, porque al hacer clic
 * lo mando a registrarse y así no se queda con el botón deshabilitado.
 */
const puedeConfirmar = computed(() => {
  if (carrito.cargando || !carrito.articulos.length || haySinStock.value) return false
  if (!estaRegistrado.value) return true
  if (carrito.tipoPago === 'QR / YAPE' && !qrPagado.value) return false
  if (carrito.tipoPago === 'EFECTIVO' && faltanteEfectivo.value > 0) return false
  return true
})

// Patrón decorativo: QR genérico de demostración (no procesa pagos reales).
const qrCeldas = computed(() => generarPatronQr())

/**
 * Cada vez que se abre el carrito vuelvo a pedir los almacenes y el catálogo,
 * así trabajo con el stock real y no con el que quedó guardado en el navegador.
 */
async function preparar() {
  preparando.value = true
  try {
    const [resAlmacenes, resPantallas] = await Promise.all([
      clienteApi.get('almacenes').catch(() => ({ data: [] })),
      clienteApi.get('pantallas').catch(() => ({ data: [] })),
    ])

    almacenes.value = Array.isArray(resAlmacenes.data) ? resAlmacenes.data : []

    const catalogo: Pantalla[] = Array.isArray(resPantallas.data) ? resPantallas.data : []
    if (catalogo.length) {
      const descartados = carrito.sincronizarProductos(catalogo)
      if (descartados.length) {
        notify.warn(`Ya no disponibles: ${descartados.join(', ')}`)
      }
    }

    if (!carrito.nombreCliente && sesion.estaAutenticado) {
      carrito.nombreCliente = sesion.nombreCompleto || sesion.usuario
    }

    if (!carrito.idAlmacen && almacenes.value.length === 1) {
      carrito.seleccionarAlmacen(almacenes.value[0]?.id ?? null)
    }
  } catch {
    notify.error('No se pudo actualizar la disponibilidad del carrito')
  } finally {
    preparando.value = false
  }
}

watch(visible, (abierto) => {
  if (abierto) {
    preparar()
  } else {
    qrPagado.value = false
    efectivoRecibido.value = null
  }
})

watch(
  () => carrito.tipoPago,
  (metodo) => {
    if (metodo === 'EFECTIVO' && !carrito.idAlmacen) {
      carrito.tipoPago = 'TRANSFERENCIA BANCARIA'
      return
    }
    if (metodo !== 'QR / YAPE') qrPagado.value = false
    if (metodo !== 'EFECTIVO') efectivoRecibido.value = null
  },
)

watch(
  () => carrito.total,
  () => {
    qrPagado.value = false
  },
)

function ocultarImagen(evento: Event) {
  const img = evento.target as HTMLImageElement
  img.style.visibility = 'hidden'
}

function cambiar(articulo: ArticuloCarrito, delta: number) {
  const resultado = carrito.cambiarCantidad(articulo.pantalla.id, delta)
  if (!resultado.ok && resultado.motivo === 'LIMITE') {
    notify.warn(`Solo hay ${resultado.disponible} unidad(es) disponibles en este almacén`)
  }
}

/**
 * Mando al visitante a registrarse y me acuerdo de que venía a pagar
 * (pendienteCheckout) para reabrirle el carrito cuando termine.
 */
function irARegistro() {
  carrito.pendienteCheckout = true
  sesion.rutaRetorno = '/'
  carrito.cerrar()
  router.push({ name: 'registro' })
}

function irAIniciarSesion() {
  carrito.pendienteCheckout = true
  sesion.rutaRetorno = '/'
  carrito.cerrar()
  router.push({ name: 'login' })
}

/** Simulo el pago con QR (no hay pasarela real), solo marco que ya pagó. */
function simularPagoQr() {
  qrPagado.value = true
  notify.success(`Pago exitoso por ${formatearMoneda(carrito.total)}`)
}

/**
 * Confirmar la compra: primero valido en el navegador (sucursal, stock,
 * registro, nombre, QR y efectivo) para dar mensajes claros, y después mando
 * la venta a la API. El backend vuelve a revisar el stock y calcula el total.
 * Si no está registrado lo mando a /registro sin borrarle el carrito.
 */
async function confirmar() {
  if (!carrito.articulos.length) return

  if (!carrito.idAlmacen) {
    notify.warn('Selecciona la sucursal o almacén de retiro')
    return
  }

  const sinStock = carrito.articulos.find((articulo) => carrito.sinStockEnSucursal(articulo))
  if (sinStock) {
    notify.error(`"${sinStock.pantalla.nombre}" no tiene stock en la sucursal elegida`)
    return
  }

  const excede = carrito.articulos.find(
    (articulo) => articulo.cantidad > carrito.stockEnAlmacen(articulo.pantalla, carrito.idAlmacen),
  )
  if (excede) {
    notify.error(`Stock insuficiente de "${excede.pantalla.nombre}" en esta sucursal`)
    return
  }

  if (!estaRegistrado.value) {
    notify.info(
      'Debes registrarte como usuario nuevo para poder empezar a hacer el pago. Tu carrito se conserva.',
    )
    irARegistro()
    return
  }

  if (!carrito.nombreCliente.trim()) {
    notify.warn('Ingresa tu nombre o razón social')
    return
  }

  if (carrito.tipoPago === 'QR / YAPE' && !qrPagado.value) {
    notify.warn('Confirma el pago con QR antes de finalizar la compra')
    return
  }

  if (carrito.tipoPago === 'EFECTIVO' && faltanteEfectivo.value > 0) {
    notify.warn(`Faltan ${formatearMoneda(faltanteEfectivo.value)} para cubrir el total`)
    return
  }

  carrito.cargando = true
  try {
    await clienteApi.post('ventas', {
      idUsuario: Number(sesion.userId || 1),
      idAlmacen: Number(carrito.idAlmacen),
      nombreCliente: carrito.nombreCliente.trim(),
      documentoCliente: carrito.documentoCliente.trim() || '0',
      tipoPago: carrito.tipoPago,
      detalles: carrito.articulos.map((articulo) => ({
        idPantalla: Number(articulo.pantalla.id),
        cantidad: Number(articulo.cantidad),
        precioUnitario: Number(articulo.pantalla.precioVenta),
      })),
    })

    const totalCompra = carrito.total
    const cambioFinal = cambio.value
    const metodoFinal = carrito.tipoPago
    carrito.vaciar()
    carrito.cerrar()
    carrito.notificarCambioCatalogo()
    const etiquetaFinal = metodos.find((metodo) => metodo.valor === metodoFinal)?.etiqueta ?? ''
    notify.success(`Compra confirmada por ${formatearMoneda(totalCompra)} · ${etiquetaFinal}`)
    if (metodoFinal === 'EFECTIVO' && cambioFinal > 0) {
      notify.info(`Cambio a devolver: ${formatearMoneda(cambioFinal)}`)
    }
  } catch (error) {
    notify.error(mensajeDeError(error, 'No se pudo procesar la compra'))
  } finally {
    carrito.cargando = false
  }
}
</script>

<template>
  <Drawer v-model:visible="visible" position="right" :style="{ width: '28rem' }" class="carrito-drawer"
    :header="`Carrito (${carrito.unidades})`">
    <div v-if="!carrito.articulos.length" class="empty-state">
      <div class="empty-state__icon"><i class="pi pi-shopping-cart"></i></div>
      <h3 class="h6 mb-1">Tu carrito está vacío</h3>
      <p class="mb-3">Agrega pantallas del catálogo para continuar con tu compra.</p>
      <button type="button" class="btn btn-outline-secondary" @click="carrito.cerrar()">
        Volver al catálogo
      </button>
    </div>

    <div v-else class="carrito-body">
      <div v-if="preparando" class="carrito-loading">
        <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        Actualizando disponibilidad…
      </div>

      <div class="carrito-articulos">
        <div v-for="articulo in carrito.articulos" :key="articulo.pantalla.id" class="carrito-articulo">
          <img :src="articulo.pantalla.fotografia" :alt="articulo.pantalla.nombre" loading="lazy" @error="ocultarImagen" />

          <div>
            <div class="carrito-item__name">{{ articulo.pantalla.nombre }}</div>
            <div class="carrito-item__meta">
              {{ formatearMoneda(articulo.pantalla.precioVenta) }} c/u ·
              <template v-if="carrito.sinStockEnSucursal(articulo)">
                <span class="text-danger fw-semibold">Sin stock en esta sucursal</span>
              </template>
              <template v-else>
                Stock: <strong>{{ carrito.disponible(articulo.pantalla) }}</strong>
              </template>
            </div>

            <div class="carrito-item__controls">
              <div class="qty">
                <button type="button" aria-label="Quitar una unidad" :disabled="articulo.cantidad <= 1"
                  @click="cambiar(articulo, -1)">−</button>
                <span>{{ articulo.cantidad }}</span>
                <button type="button" aria-label="Agregar una unidad" @click="cambiar(articulo, 1)">+</button>
              </div>
              <button type="button" class="btn btn-link btn-sm text-danger p-0 ms-2"
                @click="carrito.quitar(articulo.pantalla.id)">Quitar</button>
            </div>
          </div>

          <div class="carrito-item__price">
            {{ formatearMoneda(articulo.cantidad * Number(articulo.pantalla.precioVenta)) }}
          </div>
        </div>
      </div>

      <div class="carrito-section">
        <h6>Sucursal / almacén de retiro</h6>
        <select v-model="almacenSeleccionado" class="form-select form-select-sm">
          <option value="">Selecciona una sucursal</option>
          <option v-for="almacen in almacenes" :key="almacen.id" :value="String(almacen.id)">
            {{ almacen.nombre }} — {{ almacen.direccion }}
          </option>
        </select>
      </div>

      <div v-if="!estaRegistrado" class="payment-locked">
        <i class="pi pi-lock"></i>
        <h6>Necesitas registrarte para pagar</h6>
        <p>
          Para empezar a hacer el pago debes registrarte como usuario nuevo. Crea tu cuenta de
          cliente y continúa con este mismo carrito.
        </p>
        <button type="button" class="btn btn-primary w-100" @click="irARegistro">
          <i class="pi pi-user-plus me-1"></i>Registrarme como usuario nuevo
        </button>
        <button type="button" class="btn btn-link btn-sm w-100" @click="irAIniciarSesion">
          Ya tengo una cuenta, iniciar sesión
        </button>
      </div>

      <div v-if="estaRegistrado" class="carrito-section">
        <h6>Datos del cliente</h6>
        <div class="row g-2">
          <div class="col-12 col-sm-7">
            <input v-model="carrito.nombreCliente" class="form-control form-control-sm" placeholder="Nombre o razón social"
              aria-label="Nombre o razón social" />
          </div>
          <div class="col-12 col-sm-5">
            <input v-model="carrito.documentoCliente" class="form-control form-control-sm" placeholder="NIT / CI"
              aria-label="NIT o CI" />
          </div>
        </div>
      </div>

      <div v-if="estaRegistrado" class="carrito-section">
        <h6>Método de pago</h6>
        <div class="payment-grid">
          <button v-for="metodo in metodosDisponibles" :key="metodo.valor" type="button" class="payment-option"
            :class="{ 'is-active': carrito.tipoPago === metodo.valor }" @click="carrito.tipoPago = metodo.valor">
            <i :class="metodo.icono"></i>
            <span>{{ metodo.etiqueta }}</span>
          </button>
        </div>

        <!-- Transferencia: alternativas de cuenta -->
        <div v-if="carrito.tipoPago === 'TRANSFERENCIA BANCARIA'" class="payment-panel">
          <label class="payment-panel__label" for="opcion-transferencia">Cuenta de destino</label>
          <select id="opcion-transferencia" v-model="opcionTransferencia" class="form-select form-select-sm">
            <option v-for="opcion in OPCIONES_TRANSFERENCIA" :key="opcion.id" :value="opcion.id">
              {{ opcion.banco }}
            </option>
          </select>
          <div v-if="transferenciaSeleccionada" class="payment-account">
            <div><span>Cuenta</span><strong>{{ transferenciaSeleccionada.cuenta }}</strong></div>
            <div><span>Titular</span><strong>{{ transferenciaSeleccionada.titular }}</strong></div>
            <small>Datos de ejemplo configurables en <code>src/config/pagos.ts</code>.</small>
          </div>
          <p class="payment-note">
            Al confirmar, envía el comprobante por WhatsApp para validar el pago.
          </p>
        </div>

        <!-- QR genérico -->
        <div v-else-if="carrito.tipoPago === 'QR / YAPE'" class="payment-panel">
          <div v-if="!qrPagado" class="qr-box">
            <div class="qr-demo" aria-hidden="true">
              <span v-for="(activa, indice) in qrCeldas" :key="indice" :class="{ 'is-on': activa }"></span>
            </div>
            <div class="qr-box__info">
              <strong>{{ QR_PAGO.etiqueta }}</strong>
              <span>Ref. {{ QR_PAGO.referencia }}</span>
              <span class="price" style="font-size: 1rem">{{ formatearMoneda(carrito.total) }}</span>
              <button type="button" class="btn btn-sm btn-outline-primary mt-1" @click="simularPagoQr">
                <i class="pi pi-qrcode me-1"></i>Simular escaneo y pago
              </button>
            </div>
          </div>

          <div v-else class="payment-success">
            <i class="pi pi-check-circle"></i>
            <div>
              <strong>Pago exitoso</strong>
              <span>{{ formatearMoneda(carrito.total) }} · {{ QR_PAGO.referencia }}</span>
            </div>
            <button type="button" class="btn btn-sm btn-link ms-auto" @click="qrPagado = false">
              Deshacer
            </button>
          </div>
          <p class="payment-note">{{ QR_PAGO.nota }}</p>
        </div>

        <!-- Efectivo con cálculo de cambio -->
        <div v-else-if="carrito.tipoPago === 'EFECTIVO'" class="payment-panel">
          <label class="payment-panel__label" for="efectivo-recibido">Efectivo recibido (Bs.)</label>
          <input id="efectivo-recibido" v-model.number="efectivoRecibido" type="number" min="0" step="0.5"
            class="form-control form-control-sm" placeholder="0.00" />

          <div class="payment-account mt-2">
            <div><span>Total a pagar</span><strong>{{ formatearMoneda(carrito.total) }}</strong></div>
            <div><span>Recibido</span><strong>{{ formatearMoneda(efectivoRecibido ?? 0) }}</strong></div>
            <div :class="faltanteEfectivo > 0 ? 'text-danger' : 'text-success'">
              <span>{{ faltanteEfectivo > 0 ? 'Falta' : 'Cambio' }}</span>
              <strong>{{ formatearMoneda(faltanteEfectivo > 0 ? faltanteEfectivo : cambio) }}</strong>
            </div>
          </div>

          <p class="payment-note">
            Paga en caja al retirar en {{ nombreAlmacen || 'la sucursal' }}.
          </p>
        </div>

        <p v-if="!carrito.idAlmacen" class="payment-note mb-0">
          <i class="pi pi-info-circle me-1"></i>Elige una sucursal para habilitar el pago en efectivo.
        </p>
      </div>

      <div class="carrito-totals">
        <div class="carrito-total-row">
          <span>Productos</span>
          <span>{{ carrito.unidades }} unidad(es)</span>
        </div>
        <div v-if="nombreAlmacen" class="carrito-total-row">
          <span>Sucursal</span>
          <span>{{ nombreAlmacen }}</span>
        </div>
        <div class="carrito-total-row carrito-total-row--strong mt-2">
          <span>Total</span>
          <span class="text-brand">{{ formatearMoneda(carrito.total) }}</span>
        </div>
        <p v-if="haySinStock" class="small text-danger mb-0 mt-2">
          Hay productos sin stock en la sucursal seleccionada.
        </p>
      </div>
    </div>

    <template #footer>
      <div class="d-flex gap-2 w-100">
        <button type="button" class="btn btn-outline-secondary" @click="carrito.cerrar()">
          Seguir comprando
        </button>
        <button type="button" class="btn btn-primary flex-grow-1 d-flex align-articulos-center justify-content-center gap-2"
          :disabled="!puedeConfirmar" @click="confirmar">
          <span v-if="carrito.cargando" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
          <i v-else :class="estaRegistrado ? 'pi pi-check' : 'pi pi-user-plus'"></i>
          {{ carrito.cargando ? 'Procesando…' : estaRegistrado ? 'Confirmar compra' : 'Registrarme para pagar' }}
        </button>
      </div>
    </template>
  </Drawer>
</template>
