<script setup lang="ts">
import type { Almacen } from '@/models/almacen'
import type { Pantalla } from '@/models/pantalla'
import type { Usuario } from '@/models/usuario'
import type { TipoPago } from '@/models/venta'
import DetallePago from '@/components/pago/DetallePago.vue'
import clienteApi from '@/plugins/axios'
import { useSesionStore } from '@/stores'
import { METODOS_PAGO } from '@/config/pagos'
import { formatearMoneda } from '@/helpers'
import { coincideBusqueda } from '@/helpers/busqueda'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import {
  Button,
  Checkbox,
  Dialog,
  InputGroup,
  InputGroupAddon,
  InputNumber,
  InputText,
  Select,
} from 'primevue'
import { computed, ref, watch } from 'vue'

const sesion = useSesionStore()
const props = defineProps({ mostrar: Boolean })
const emit = defineEmits(['guardar', 'close', 'factura'])

const almacenes = ref<Almacen[]>([])
const pantallas = ref<Pantalla[]>([])
const clientesRegistrados = ref<Usuario[]>([])

const idAlmacen = ref<number | null>(null)
const tipoCliente = ref<'SIN_REGISTRAR' | 'REGISTRADO'>('SIN_REGISTRAR')
const idClienteSeleccionado = ref<number | null>(null)
const nombreCliente = ref('S/N')
// El NIT / CI arranca vacío: si no se escribe nada, al guardar se manda "0".
const documentoCliente = ref('')
const tipoPago = ref<TipoPago>('TRANSFERENCIA BANCARIA')
const generarFactura = ref(true)

const almacenBloqueado = computed(
  () => sesion.rol === 'VENDEDOR' && sesion.tieneSucursal,
)

// Panel de cobro: leo el vuelto para avisarlo al guardar y lo reinicio en cada
// apertura para no arrastrar el efectivo de una venta anterior.
const panelPago = ref<InstanceType<typeof DetallePago> | null>(null)
const nombreAlmacenSeleccionado = computed(
  () => almacenes.value.find((almacen) => almacen.id === idAlmacen.value)?.nombre ?? '',
)

const mostrarFormNuevoCliente = ref(false)
const nuevoClienteUsuario = ref('')
const nuevoClienteCorreo = ref('')
const nuevoClienteTelefono = ref('')
const nuevoClienteDocumento = ref('')
const nuevoClienteClave = ref('')

// Dejo el alta rápida en blanco (incluida la contraseña) para no arrastrar lo
// que se escribió en una venta anterior.
function limpiarFormularioClienteRapido() {
  nuevoClienteUsuario.value = ''
  nuevoClienteCorreo.value = ''
  nuevoClienteTelefono.value = ''
  nuevoClienteDocumento.value = ''
  nuevoClienteClave.value = ''
}

// Con "Cliente registrado" tildado no tiene sentido dar de alta otro cliente:
// el botón se deshabilita hasta volver a "Cliente sin registrar".
const modoClienteRegistrado = computed(() => tipoCliente.value === 'REGISTRADO')

// Si el botón se deshabilita, cierro el formulario rápido de alta para que no
// quede abierto un formulario que ya no se puede usar.
watch(modoClienteRegistrado, (deshabilitado) => {
  if (deshabilitado) mostrarFormNuevoCliente.value = false
})

// Si el navegador alcanzó a autocompletar algo mientras el formulario estaba
// cerrado, al abrirlo lo vuelvo a dejar en blanco.
watch(mostrarFormNuevoCliente, (abierto) => {
  if (abierto) limpiarFormularioClienteRapido()
})

// Buscador de clientes registrados: filtro por nombre y NIT / CI (y también el
// teléfono, que suele dictarse en caja) para no abrir una lista larga a ojo.
const busquedaCliente = ref('')
const clientesFiltrados = computed(() =>
  clientesRegistrados.value.filter((usuario) =>
    coincideBusqueda(busquedaCliente.value, [
      usuario.nombreUsuario,
      usuario.nombre,
      usuario.primerApellido,
      usuario.segundoApellido,
      usuario.documento,
      usuario.telefono,
    ]),
  ),
)

// Nombre para la factura: uso nombre y apellidos si los cargó y, si no, el
// nombre de usuario.
function nombreCompletoCliente(cliente: Usuario): string {
  return (
    [cliente.nombre, cliente.primerApellido, cliente.segundoApellido]
      .filter(Boolean)
      .join(' ') || cliente.nombreUsuario
  )
}

const idPantalla = ref<number | null>(null)

// Buscador de productos: filtro la lista que alimenta al selector por nombre,
// código SKU, marca y modelo para no recorrer el catálogo entero a mano.
const busquedaPantalla = ref('')
const pantallasFiltradas = computed(() =>
  pantallas.value.filter((pantalla) =>
    coincideBusqueda(busquedaPantalla.value, [
      pantalla.nombre,
      pantalla.codigo,
      pantalla.modelo?.nombre,
      pantalla.modelo?.marca?.nombre,
    ]),
  ),
)

// Si la pantalla elegida deja de estar entre los resultados, la cambio por la
// primera coincidencia para que el selector no muestre un id que ya no aparece.
watch(busquedaPantalla, () => {
  const sigueVisible = pantallasFiltradas.value.some((p) => p.id === idPantalla.value)
  if (!sigueVisible) idPantalla.value = pantallasFiltradas.value[0]?.id ?? null
})

const cantidad = ref<number>(1)
const detalles = ref<
  {
    idPantalla: number
    nombre: string
    cantidad: number
    precioUnitario: number
  }[]
>([])

// Stock real de una pantalla en el almacén de salida. La lista de pantallas ya
// trae el inventario de cada sucursal, así que no hace falta otra petición.
function stockEnAlmacen(
  idProducto: number,
  idSucursal: number | null = idAlmacen.value,
): number {
  const pantalla = pantallas.value.find((p) => p.id === idProducto)
  const inventario = (pantalla?.inventarios ?? []).find(
    (inv) => Number(inv.idAlmacen) === Number(idSucursal),
  )
  return Number(inventario?.cantidad ?? 0)
}

const stockPantallaSeleccionada = computed(() =>
  idPantalla.value ? stockEnAlmacen(idPantalla.value) : 0,
)

function cantidadEnVenta(idProducto: number): number {
  return detalles.value.find((d) => d.idPantalla === idProducto)?.cantidad ?? 0
}

// Si se cambia la sucursal de salida, ajusto la venta al stock de la nueva
// sucursal: quito lo que no hay y recorto lo que excede, avisando al vendedor.
watch(idAlmacen, (nuevo) => {
  if (!nuevo || detalles.value.length === 0) return
  const ajustes: string[] = []
  detalles.value = detalles.value.filter((articulo) => {
    const disponible = stockEnAlmacen(articulo.idPantalla, nuevo)
    if (disponible <= 0) {
      ajustes.push(`${articulo.nombre}: sin stock en esta sucursal, se quitó de la venta`)
      return false
    }
    if (articulo.cantidad > disponible) {
      ajustes.push(`${articulo.nombre}: ajustado a ${disponible} unidad(es)`)
      articulo.cantidad = disponible
    }
    return true
  })
  if (ajustes.length > 0) notify.warn(ajustes.join(' · '))
})

const dialogoVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

async function cargarDatos() {
  const [resAlm, resPan, resUsu] = await Promise.all([
    clienteApi.get('almacenes'),
    clienteApi.get('pantallas'),
    clienteApi.get('usuarios').catch(() => ({ data: [] })),
  ])
  almacenes.value = resAlm.data
  pantallas.value = resPan.data
  clientesRegistrados.value = (resUsu.data as Usuario[]).filter((u) => u.rol === 'CLIENTE')

  if (almacenes.value.length > 0 && !idAlmacen.value) {
    idAlmacen.value = almacenes.value[0]?.id ?? null
  }
  if (sesion.rol === 'VENDEDOR' && sesion.tieneSucursal) {
    idAlmacen.value = sesion.idAlmacen
  }
  if (pantallas.value.length > 0 && !idPantalla.value) {
    idPantalla.value = pantallas.value[0]?.id ?? null
  }
}

watch(
  () => props.mostrar,
  async (val) => {
    if (val) {
      await cargarDatos()
      detalles.value = []
      tipoCliente.value = 'SIN_REGISTRAR'
      idClienteSeleccionado.value = null
      busquedaCliente.value = ''
      nombreCliente.value = 'S/N'
      documentoCliente.value = ''
      limpiarFormularioClienteRapido()
      mostrarFormNuevoCliente.value = false
      busquedaPantalla.value = ''
      panelPago.value?.reiniciar()
      cantidad.value = 1
      tipoPago.value = 'TRANSFERENCIA BANCARIA'
      generarFactura.value = true
      if (sesion.rol === 'VENDEDOR' && sesion.tieneSucursal) {
        idAlmacen.value = sesion.idAlmacen
      }
    }
  },
)

// Al elegir un cliente registrado piso el "S/N" y el "0" de la venta anónima
// con sus datos reales, que es lo que se imprime en la factura.
function seleccionarClienteRegistrado(cliente: Usuario) {
  idClienteSeleccionado.value = cliente.id
  nombreCliente.value = nombreCompletoCliente(cliente)
  documentoCliente.value = cliente.documento ?? ''
}

// Cambio de tipo de cliente: al volver a "sin registrar" dejo los valores por
// defecto (S/N y 0) y al pasar a "registrado" limpio esos dos campos para que
// el cajero escriba o elija un cliente, sin que el S/N se cuele en la factura.
function cambiarTipoCliente() {
  idClienteSeleccionado.value = null
  busquedaCliente.value = ''
  limpiarFormularioClienteRapido()
  if (tipoCliente.value === 'SIN_REGISTRAR') {
    nombreCliente.value = 'S/N'
    documentoCliente.value = ''
    return
  }
  nombreCliente.value = ''
  documentoCliente.value = ''
}

// Al presionar el botón +: si la pantalla ya está en la lista, AUMENTA su cantidad,
// pero nunca más allá del stock que hay en la sucursal de salida.
function agregarItem() {
  const cantAgregar = Number(cantidad.value) || 1

  const p = idPantalla.value
    ? pantallas.value.find((x) => x.id === idPantalla.value)
    : null

  if (!p) {
    // Si el selector quedó vacío pero ya hay un ítem en la lista, le sumo al
    // último ítem agregado, controlando también su stock.
    const ultimo = detalles.value[detalles.value.length - 1]
    if (ultimo) {
      if (ultimo.cantidad + cantAgregar > stockEnAlmacen(ultimo.idPantalla)) {
        notify.warn(
          `Stock insuficiente de "${ultimo.nombre}". Disponible en esta sucursal: ${stockEnAlmacen(ultimo.idPantalla)}`,
        )
        return
      }
      ultimo.cantidad += cantAgregar
      cantidad.value = 1
      return
    }
    notify.warn('Selecciona una pantalla de la lista')
    return
  }

  const disponible = stockEnAlmacen(p.id)
  const yaEnVenta = cantidadEnVenta(p.id)

  if (disponible <= 0) {
    notify.warn(
      `"${p.nombre}" no tiene stock en ${nombreAlmacenSeleccionado.value || 'esta sucursal'}`,
    )
    return
  }

  if (yaEnVenta + cantAgregar > disponible) {
    notify.warn(
      `Stock insuficiente de "${p.nombre}". Disponible: ${disponible}, ya en la venta: ${yaEnVenta}`,
    )
    return
  }

  const existente = detalles.value.find((d) => d.idPantalla === p.id)

  if (existente) {
    existente.cantidad += cantAgregar
  } else {
    detalles.value.push({
      idPantalla: p.id,
      nombre: p.nombre,
      cantidad: cantAgregar,
      precioUnitario: Number(p.precioVenta),
    })
  }

  cantidad.value = 1
}

function cambiarCantidadItem(indice: number, delta: number) {
  const articulo = detalles.value[indice]
  if (!articulo) return
  const nueva = articulo.cantidad + delta
  if (nueva < 1) return

  // Al sumar unidades no dejo pasar el stock disponible en la sucursal.
  if (delta > 0) {
    const disponible = stockEnAlmacen(articulo.idPantalla)
    if (nueva > disponible) {
      notify.warn(
        `Solo hay ${disponible} unidad(es) de "${articulo.nombre}" en ${nombreAlmacenSeleccionado.value || 'esta sucursal'}`,
      )
      return
    }
  }

  articulo.cantidad = nueva
}

function quitarItem(indice: number) {
  detalles.value.splice(indice, 1)
}

async function registrarNuevoClienteRapido() {
  // El CI / NIT también es obligatorio: con ese documento queda identificado
  // el cliente en la venta y en la factura.
  if (
    !nuevoClienteUsuario.value ||
    !nuevoClienteCorreo.value ||
    !nuevoClienteDocumento.value.trim() ||
    !nuevoClienteClave.value
  ) {
    notify.warn('Completa usuario, correo, NIT / CI y contraseña para registrar al cliente')
    return
  }
  try {
    const res = await clienteApi.post('usuarios', {
      nombreUsuario: nuevoClienteUsuario.value,
      correo: nuevoClienteCorreo.value,
      telefono: nuevoClienteTelefono.value,
      documento: nuevoClienteDocumento.value.trim(),
      clave: nuevoClienteClave.value,
      rol: 'CLIENTE',
      activo: true,
    })
    const creado: Usuario = res.data
    clientesRegistrados.value.push(creado)
    tipoCliente.value = 'REGISTRADO'
    idClienteSeleccionado.value = creado.id
    nombreCliente.value = nombreCompletoCliente(creado)
    documentoCliente.value = creado.documento ?? ''
    mostrarFormNuevoCliente.value = false
    limpiarFormularioClienteRapido()
    notify.success(`Cliente "${creado.nombreUsuario}" registrado y seleccionado`)
  } catch (error) {
    notify.error(mensajeDeError(error, 'Error al registrar el cliente'))
  }
}

const totalVenta = computed(() =>
  detalles.value.reduce((acc, d) => acc + Number(d.cantidad) * Number(d.precioUnitario), 0),
)

// Valido lo mínimo, mando la venta y, si corresponde, traigo la venta completa
// para abrir la factura. El total lo calcula el backend, no lo mando yo.
async function guardarCambios() {
  if (!idAlmacen.value) {
    notify.warn('Selecciona un almacén de salida')
    return
  }
  if (detalles.value.length === 0) {
    notify.warn('Agrega al menos una pantalla a la venta')
    return
  }
  if (!nombreCliente.value.trim()) {
    notify.warn('Ingresa el nombre del cliente')
    return
  }

  // Última revisión contra el stock de la sucursal antes de enviar: si otro
  // vendedor vendió mientras tanto, se avisa acá y el backend igual lo rechaza.
  const itemSinStock = detalles.value.find(
    (d) => d.cantidad > stockEnAlmacen(d.idPantalla),
  )
  if (itemSinStock) {
    notify.warn(
      `Stock insuficiente de "${itemSinStock.nombre}". Disponible en esta sucursal: ${stockEnAlmacen(itemSinStock.idPantalla)}`,
    )
    return
  }

  try {
    const { data: creada } = await clienteApi.post('ventas', {
      idUsuario: Number(sesion.userId || 1),
      idAlmacen: Number(idAlmacen.value),
      nombreCliente: nombreCliente.value.trim() || 'S/N',
      documentoCliente: documentoCliente.value.trim() || '0',
      tipoPago: tipoPago.value,
      detalles: detalles.value.map((d) => ({
        idVenta: 1,
        idPantalla: Number(d.idPantalla),
        cantidad: Number(d.cantidad),
        precioUnitario: Number(d.precioUnitario),
      })),
    })

    if (generarFactura.value && creada?.id) {
      const { data: completa } = await clienteApi.get(`ventas/${creada.id}`)
      emit('factura', completa)
    }

    // Leo el vuelto antes de vaciar el detalle: al quedar el total en cero el
    // panel de cobro se reinicia y perdería el monto.
    const cambio = panelPago.value?.cambio ?? 0

    emit('guardar')
    dialogoVisible.value = false
    detalles.value = []
    nombreCliente.value = 'S/N'
    documentoCliente.value = ''
    notify.success('Venta registrada exitosamente')
    // Refresco el catálogo para que el stock mostrado quede actualizado.
    void cargarDatos()
    if (tipoPago.value === 'EFECTIVO' && cambio > 0) {
      notify.info(`Cambio a devolver: ${formatearMoneda(cambio)}`)
    }
  } catch (error) {
    notify.error(mensajeDeError(error, 'Error al registrar la venta'))
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogoVisible" header="Registrar Nueva Venta" :style="{ width: '38rem' }" modal>
    <div class="d-flex flex-column gap-3 pt-2">
      <!-- Orden del formulario de lo general a lo particular: primero quién
           compra (cliente), después desde qué sucursal sale la mercadería
           (almacén), luego qué se lleva (pantallas) y al final cómo paga. -->
      <!-- Opciones de Cliente: Sin registrar / Registrado / Nuevo Usuario -->
      <div class="p-3 rounded border">
        <div class="d-flex justify-content-between align-articulos-center mb-2 flex-wrap gap-2">
          <div class="d-flex gap-3">
            <label class="d-flex align-articulos-center gap-1" style="cursor: pointer">
              <input type="radio" value="SIN_REGISTRAR" v-model="tipoCliente" @change="cambiarTipoCliente" />
              <span>Cliente sin registrar</span>
            </label>
            <label class="d-flex align-articulos-center gap-1" style="cursor: pointer">
              <input type="radio" value="REGISTRADO" v-model="tipoCliente" @change="cambiarTipoCliente" />
              <span>Cliente registrado</span>
            </label>
          </div>

          <Button type="button" :label="mostrarFormNuevoCliente ? 'Cancelar Registro' : 'Registrar Cliente'"
            size="small" severity="info" :disabled="modoClienteRegistrado"
            :title="modoClienteRegistrado
              ? 'Para dar de alta uno nuevo cambia a Cliente sin registrar'
              : 'Dar de alta un cliente nuevo'"
            @click="mostrarFormNuevoCliente = !mostrarFormNuevoCliente" />
        </div>

        <!-- Formulario para crear usuario cliente ahí mismo. Le pongo
             autocomplete="off" y nombres que no parecen de login para que el
             navegador no lo rellene con las credenciales del que está logueado. -->
        <div v-if="mostrarFormNuevoCliente" class="p-3 mb-3 rounded border" autocomplete="off">
          <div class="fw-bold mb-2 small">Nuevo Usuario Cliente</div>
          <div class="row g-2">
            <div class="col-6">
              <InputText v-model="nuevoClienteUsuario" placeholder="Nombre de Usuario" class="w-100"
                name="nuevo-cliente-usuario" autocomplete="off" />
            </div>
            <div class="col-6">
              <InputText v-model="nuevoClienteCorreo" placeholder="Correo electrónico" class="w-100"
                name="nuevo-cliente-correo" autocomplete="off" />
            </div>
            <div class="col-6">
              <InputText v-model="nuevoClienteTelefono" placeholder="Teléfono" class="w-100"
                name="nuevo-cliente-telefono" autocomplete="off" />
            </div>
            <div class="col-6">
              <InputText v-model="nuevoClienteDocumento" placeholder="NIT / CI" class="w-100"
                name="nuevo-cliente-documento" autocomplete="off" />
            </div>
            <div class="col-6">
              <InputText v-model="nuevoClienteClave" type="password" placeholder="Contraseña (mín. 6)"
                class="w-100" name="nuevo-cliente-clave" autocomplete="new-password" />
            </div>
          </div>
          <div class="text-end mt-2">
            <Button type="button" label="Crear y Seleccionar Cliente" size="small"
              @click="registrarNuevoClienteRapido" />
          </div>
        </div>

        <!-- Buscador de cliente registrado: los resultados se eligen con un
             clic en la misma lista, sin desplegable aparte. -->
        <div v-if="tipoCliente === 'REGISTRADO'" class="mb-2">
          <label class="fw-semibold d-block mb-1 small">Buscar Cliente Registrado</label>
          <InputGroup>
            <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
            <InputText v-model="busquedaCliente" type="text" placeholder="Nombre, NIT / CI o teléfono" />
          </InputGroup>

          <div v-if="clientesFiltrados.length > 0" class="lista-clientes mt-2">
            <button v-for="cliente in clientesFiltrados" :key="cliente.id" type="button"
              class="cliente-opcion" :class="{ 'is-activo': cliente.id === idClienteSeleccionado }"
              @click="seleccionarClienteRegistrado(cliente)">
              <span class="fw-semibold">{{ cliente.nombreUsuario }}</span>
              <small class="text-muted">
                {{ nombreCompletoCliente(cliente) }} · NIT / CI {{ cliente.documento || 'S/N' }}
              </small>
            </button>
          </div>
          <small v-else class="text-muted d-block mt-2">
            {{ clientesRegistrados.length === 0
              ? 'No hay clientes registrados todavía.'
              : 'Ningún cliente coincide con la búsqueda.' }}
          </small>

          <small v-if="busquedaCliente.trim() && clientesFiltrados.length > 0" class="text-muted">
            {{ clientesFiltrados.length }} de {{ clientesRegistrados.length }} clientes
          </small>
        </div>

        <!-- Nombre y NIT/CI -->
        <div class="row g-2">
          <div class="col-12 col-md-7">
            <label class="fw-semibold d-block mb-1 small">Nombre Cliente</label>
            <InputText v-model="nombreCliente" class="w-100" placeholder="S/N" />
          </div>
          <div class="col-12 col-md-5">
            <label class="fw-semibold d-block mb-1 small">NIT / CI</label>
            <InputText v-model="documentoCliente" class="w-100" placeholder="NIT / CI" />
          </div>
        </div>
      </div>

      <!-- Almacén -->
      <div>
        <label class="fw-semibold d-block mb-1">Almacén de Salida</label>
        <Select v-model="idAlmacen" :options="almacenes" optionLabel="nombre" optionValue="id"
          placeholder="Seleccione almacén" class="w-100" :disabled="almacenBloqueado" />
        <small v-if="almacenBloqueado" class="text-muted">
          Tu usuario solo puede vender desde la sucursal que tiene asignada.
        </small>
      </div>

      <!-- Buscador de productos: filtra la lista antes de elegir la pantalla -->
      <div>
        <label class="fw-semibold d-block mb-1">Buscar pantalla</label>
        <InputGroup>
          <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
          <InputText v-model="busquedaPantalla" type="text"
            placeholder="Buscar por nombre, código SKU, marca o modelo" />
        </InputGroup>
        <small v-if="busquedaPantalla.trim()" class="text-muted">
          {{ pantallasFiltradas.length }} de {{ pantallas.length }} pantallas
        </small>
      </div>

      <!-- Selección de Pantalla y Cantidad -->
      <div class="row g-2 align-articulos-end">
        <div class="col-12 col-md-6">
          <label class="fw-semibold d-block mb-1">Pantalla</label>
          <Select v-model="idPantalla" :options="pantallasFiltradas" optionLabel="nombre" optionValue="id"
            placeholder="Seleccione pantalla" class="w-100">
            <template #option="slotProps">
              <div class="d-flex flex-column">
                <span class="fw-semibold">{{ slotProps.option.nombre }}</span>
                <small class="text-muted">
                  {{ slotProps.option.codigo }} · {{ slotProps.option.modelo?.marca?.nombre }}
                  {{ slotProps.option.modelo?.nombre }} · Bs. {{ slotProps.option.precioVenta }}
                </small>
              </div>
            </template>
          </Select>
          <small v-if="pantallasFiltradas.length === 0" class="text-muted">
            No se encontraron pantallas con esa búsqueda.
          </small>
          <small v-else-if="idPantalla" class="text-muted d-block mt-1">
            Stock en {{ nombreAlmacenSeleccionado || 'la sucursal' }}:
            <span class="fw-bold">{{ stockPantallaSeleccionada }}</span> unidad(es)
          </small>
        </div>
        <div class="col-6 col-md-3">
          <label class="fw-semibold d-block mb-1">Cantidad a sumar</label>
          <InputNumber v-model="cantidad" :min="1" inputClass="w-100 text-center" class="w-100" />
        </div>
        <div class="col-6 col-md-3">
          <Button type="button" label="+ Añadir / Sumar" class="w-100" @click="agregarItem" />
        </div>
      </div>

      <!-- Lista de ítems con botones - y + para aumentar/disminuir cantidad -->
      <div v-if="detalles.length > 0" class="border rounded p-2">
        <div v-for="(articulo, idx) in detalles" :key="articulo.idPantalla"
          class="d-flex justify-content-between align-articulos-center border-bottom py-2 gap-2">
          <div class="flex-grow-1">
            <div class="fw-bold">{{ articulo.nombre }}</div>
            <div class="small text-muted">
              Bs. {{ articulo.precioUnitario.toFixed(2) }} c/u · Stock:
              {{ stockEnAlmacen(articulo.idPantalla) }}
            </div>
          </div>

          <div class="d-flex align-articulos-center gap-1">
            <Button type="button" label="-" size="small" severity="secondary" @click="cambiarCantidadItem(idx, -1)" />
            <span class="px-3 fw-bold">{{ articulo.cantidad }}</span>
            <Button type="button" label="+" size="small" severity="info"
              :disabled="articulo.cantidad >= stockEnAlmacen(articulo.idPantalla)"
              @click="cambiarCantidadItem(idx, 1)" />
          </div>

          <div class="fw-bold text-end" style="min-width: 90px">
            Bs. {{ (articulo.cantidad * articulo.precioUnitario).toFixed(2) }}
          </div>

          <Button type="button" label="Quitar" severity="danger" text size="small" @click="quitarItem(idx)" />
        </div>
      </div>

      <div class="row g-2 align-articulos-end">
        <div class="col-12 col-md-6">
          <label class="fw-semibold d-block mb-1">Método de pago</label>
                          <Select v-model="tipoPago" :options="METODOS_PAGO" optionLabel="etiqueta" optionValue="valor"
                  class="w-100" />
        </div>
        <div class="col-12 col-md-6 d-flex align-articulos-center gap-2 pb-2">
          <Checkbox v-model="generarFactura" :binary="true" inputId="facturaCheck" />
          <label for="facturaCheck" class="mb-0 fw-semibold">Generar factura al guardar</label>
        </div>
      </div>

      <!-- Cobro según el método: vuelto en efectivo, QR o cuentas de destino -->
      <DetallePago ref="panelPago" :tipo-pago="tipoPago" :total="totalVenta"
        :nota-efectivo="`Cobra en caja en ${nombreAlmacenSeleccionado || 'la sucursal'} y entrega el cambio.`" />

      <div class="text-end fw-bold fs-5">Total Venta: Bs. {{ totalVenta.toFixed(2) }}</div>

      <div class="d-flex justify-content-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="dialogoVisible = false" />
        <Button type="button" label="Guardar Venta" :disabled="detalles.length === 0" @click="guardarCambios" />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
/* Resultados del buscador de clientes: filas clicables con la elegida
   resaltada, en una lista con scroll para no estirar el diálogo. */
.lista-clientes {
  max-height: 9rem;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
}

.cliente-opcion {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0.35rem 0.6rem;
  border: 0;
  background: transparent;
  text-align: left;
}

.cliente-opcion + .cliente-opcion {
  border-top: 1px solid #dee2e6;
}

.cliente-opcion:hover {
  background: rgba(13, 110, 253, 0.08);
}

.cliente-opcion.is-activo {
  background: rgba(13, 110, 253, 0.14);
}
</style>
