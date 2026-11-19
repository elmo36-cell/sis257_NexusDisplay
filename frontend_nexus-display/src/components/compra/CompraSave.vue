<script setup lang="ts">
import type { Compra } from '@/models/compra'
import type { Proveedor } from '@/models/proveedor'
import type { Almacen } from '@/models/almacen'
import type { Pantalla } from '@/models/pantalla'
import type { TipoPago } from '@/models/venta'
import DetallePago from '@/components/pago/DetallePago.vue'
import clienteApi from '@/plugins/axios'
import { useSesionStore } from '@/stores'
import { METODOS_PAGO } from '@/config/pagos'
import { aFechaLocal, formatearMoneda } from '@/helpers'
import { coincideBusqueda } from '@/helpers/busqueda'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputGroup, InputGroupAddon, InputNumber, InputText, Select } from 'primevue'
import { computed, ref, watch } from 'vue'

const sesion = useSesionStore()
const props = defineProps({
  mostrar: Boolean,
  compra: {
    type: Object as () => Compra | null,
    default: null,
  },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const proveedores = ref<Proveedor[]>([])
const almacenes = ref<Almacen[]>([])
const pantallas = ref<Pantalla[]>([])

const idProveedor = ref<number | null>(null)
const idAlmacen = ref<number | null>(null)
const idPantalla = ref<number | null>(null)
const cantidad = ref<number>(1)
const costoUnitario = ref<number>(100)
// Solo en edición: la fecha del documento se puede corregir, porque el backend
// la guarda como fecha de la compra.
const fecha = ref('')
// Forma de pago al proveedor: la uso al registrar la compra (en edición solo
// corrijo datos, no cobros) y la reinicio con el resto del formulario.
const tipoPago = ref<TipoPago>('EFECTIVO')
const panelPago = ref<InstanceType<typeof DetallePago> | null>(null)

const detalles = ref<
  {
    idPantalla: number
    nombre: string
    cantidad: number
    costoUnitario: number
  }[]
>([])

// Buscador de pantallas igual al de la venta: filtro por nombre, código SKU,
// marca y modelo para encontrar el producto sin recorrer el catálogo entero.
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

// Si la pantalla elegida deja de aparecer entre los resultados, paso a la
// primera coincidencia para que el selector no muestre un id oculto.
watch(busquedaPantalla, () => {
  const sigueVisible = pantallasFiltradas.value.some((p) => p.id === idPantalla.value)
  if (!sigueVisible) idPantalla.value = pantallasFiltradas.value[0]?.id ?? null
})

const dialogoVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

async function cargarListas() {
  const [resProv, resAlm, resPan] = await Promise.all([
    clienteApi.get('proveedores'),
    clienteApi.get('almacenes'),
    clienteApi.get('pantallas'),
  ])
  proveedores.value = resProv.data
  almacenes.value = resAlm.data
  pantallas.value = resPan.data

  if (proveedores.value.length > 0 && !idProveedor.value) {
    idProveedor.value = proveedores.value[0]?.id ?? null
  }
  if (almacenes.value.length > 0 && !idAlmacen.value) {
    idAlmacen.value = almacenes.value[0]?.id ?? null
  }
  if (pantallas.value.length > 0 && !idPantalla.value) {
    idPantalla.value = pantallas.value[0]?.id ?? null
  }
}

// Dejo el formulario listo para crear una compra nueva.
function reiniciarFormulario() {
  idProveedor.value = proveedores.value[0]?.id ?? null
  idAlmacen.value = almacenes.value[0]?.id ?? null
  idPantalla.value = pantallas.value[0]?.id ?? null
  fecha.value = ''
  tipoPago.value = 'EFECTIVO'
  panelPago.value?.reiniciar()
  busquedaPantalla.value = ''
  detalles.value = []
  cantidad.value = 1
  costoUnitario.value = 100
}

// En edición parto de los datos de la compra elegida: proveedor, sucursal,
// fecha y sus líneas, para que el admin solo corrija lo que haga falta.
function cargarCompra(compra: Compra) {
  idProveedor.value = compra.idProveedor ?? compra.proveedor?.id ?? null
  idAlmacen.value = compra.almacen?.id ?? null
  idPantalla.value = pantallas.value[0]?.id ?? null
  fecha.value = aFechaLocal(compra.fecha)
  tipoPago.value = 'EFECTIVO'
  panelPago.value?.reiniciar()
  busquedaPantalla.value = ''
  cantidad.value = 1
  costoUnitario.value = 100
  detalles.value = (compra.detalles ?? []).map((detalle) => ({
    idPantalla: detalle.pantalla?.id ?? detalle.idPantalla,
    nombre: detalle.pantalla?.nombre ?? `Pantalla #${detalle.idPantalla}`,
    cantidad: Number(detalle.cantidad),
    costoUnitario: Number(detalle.costoUnitario),
  }))
}

watch(
  () => props.mostrar,
  async (val) => {
    if (!val) return
    await cargarListas()
    if (props.modoEdicion && props.compra) {
      cargarCompra(props.compra)
      return
    }
    reiniciarFormulario()
  },
)

function agregarItem() {
  if (!idPantalla.value && detalles.value.length > 0) {
    const ultimo = detalles.value[detalles.value.length - 1]
    if (ultimo) {
      ultimo.cantidad += Number(cantidad.value) || 1
    }
    return
  }

  const p = pantallas.value.find((x) => x.id === idPantalla.value)
  if (!p) {
    notify.warn('Selecciona una pantalla de la lista')
    return
  }

  const cantAgregar = Number(cantidad.value) || 1
  const costo = Number(costoUnitario.value) || 1
  const existente = detalles.value.find((d) => d.idPantalla === p.id)

  if (existente) {
    existente.cantidad += cantAgregar
    existente.costoUnitario = costo
  } else {
    detalles.value.push({
      idPantalla: p.id,
      nombre: p.nombre,
      cantidad: cantAgregar,
      costoUnitario: costo,
    })
  }

  cantidad.value = 1
}

function cambiarCantidadItem(indice: number, delta: number) {
  const articulo = detalles.value[indice]
  if (!articulo) return
  const nueva = articulo.cantidad + delta
  if (nueva >= 1) {
    articulo.cantidad = nueva
  }
}

function quitarItem(indice: number) {
  detalles.value.splice(indice, 1)
}

const totalCompra = computed(() =>
  detalles.value.reduce((acc, d) => acc + Number(d.cantidad) * Number(d.costoUnitario), 0),
)

async function guardarCambios() {
  if (!idProveedor.value || !idAlmacen.value) {
    notify.warn('Selecciona un proveedor y un almacén receptor')
    return
  }
  if (detalles.value.length === 0) {
    notify.warn('Agrega al menos una pantalla a la compra')
    return
  }

  const cuerpo = {
    idProveedor: Number(idProveedor.value),
    idAlmacen: Number(idAlmacen.value),
    detalles: detalles.value.map((d) => ({
      idCompra: props.compra?.id ?? 1,
      idPantalla: Number(d.idPantalla),
      cantidad: Number(d.cantidad),
      costoUnitario: Number(d.costoUnitario),
    })),
  }

  try {
    if (props.modoEdicion && props.compra) {
      // El PATCH también corrige el stock: devuelve lo que había ingresado la
      // compra en su sucursal y lo vuelve a aplicar en la sucursal elegida.
      await clienteApi.patch(`compras/${props.compra.id}`, {
        ...cuerpo,
        ...(fecha.value ? { fecha: fecha.value } : {}),
      })
      notify.success('Compra actualizada y stock corregido')
    } else {
      await clienteApi.post('compras', {
        ...cuerpo,
        idUsuario: Number(sesion.userId || 1),
      })
      // Leo el vuelto antes de vaciar el detalle, que reinicia el panel.
      const cambio = panelPago.value?.cambio ?? 0
      notify.success('Compra registrada y stock actualizado exitosamente')
      if (tipoPago.value === 'EFECTIVO' && cambio > 0) {
        notify.info(`Cambio a devolver: ${formatearMoneda(cambio)}`)
      }
    }
    emit('guardar')
    dialogoVisible.value = false
    detalles.value = []
  } catch (error) {
    notify.error(
      mensajeDeError(
        error,
        props.modoEdicion ? 'Error al actualizar la compra' : 'Error al registrar la compra',
      ),
    )
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogoVisible"
    :header="modoEdicion ? 'Editar Compra a Proveedor' : 'Registrar Compra a Proveedor'"
    :style="{ width: '38rem' }" modal>
    <div class="d-flex flex-column gap-3 pt-2">
      <div class="row g-2">
        <div class="col-12 col-md-6">
          <label class="fw-semibold d-block mb-1">Proveedor</label>
          <Select v-model="idProveedor" :options="proveedores" optionLabel="nombre" optionValue="id"
            placeholder="Seleccione proveedor" class="w-100" />
        </div>
        <div class="col-12 col-md-6">
          <label class="fw-semibold d-block mb-1">Almacén Receptor</label>
          <Select v-model="idAlmacen" :options="almacenes" optionLabel="nombre" optionValue="id"
            placeholder="Seleccione almacén" class="w-100" />
        </div>
      </div>

      <div v-if="modoEdicion">
        <label class="fw-semibold d-block mb-1">Fecha de la compra</label>
        <input v-model="fecha" type="datetime-local" class="form-control" />
        <small class="text-muted">Si cambias la sucursal, el stock se mueve con la compra.</small>
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

      <div class="row g-2 align-articulos-end">
        <div class="col-12 col-md-5">
          <label class="fw-semibold d-block mb-1">Pantalla</label>
          <Select v-model="idPantalla" :options="pantallasFiltradas" optionLabel="nombre" optionValue="id"
            placeholder="Seleccione pantalla" class="w-100">
            <template #option="slotProps">
              <div class="d-flex flex-column">
                <span class="fw-semibold">{{ slotProps.option.nombre }}</span>
                <small class="text-muted">
                  {{ slotProps.option.codigo }} · {{ slotProps.option.modelo?.marca?.nombre }}
                  {{ slotProps.option.modelo?.nombre }}
                </small>
              </div>
            </template>
          </Select>
          <small v-if="pantallasFiltradas.length === 0" class="text-muted">
            No se encontraron pantallas con esa búsqueda.
          </small>
        </div>
        <div class="col-6 col-md-2">
          <label class="fw-semibold d-block mb-1">Cantidad</label>
          <InputNumber v-model="cantidad" :min="1" inputClass="w-100 text-center" class="w-100" />
        </div>
        <div class="col-6 col-md-3">
          <label class="fw-semibold d-block mb-1">Costo Unit. (Bs.)</label>
          <InputNumber v-model="costoUnitario" :min="1" mode="decimal" :minFractionDigits="2" inputClass="w-100"
            class="w-100" />
        </div>
        <div class="col-12 col-md-2">
          <Button type="button" label="+ Añadir" class="w-100" @click="agregarItem" />
        </div>
      </div>

      <div v-if="detalles.length > 0" class="border rounded p-2">
        <div v-for="(articulo, idx) in detalles" :key="articulo.idPantalla"
          class="d-flex justify-content-between align-articulos-center border-bottom py-2 gap-2">
          <div class="flex-grow-1">
            <div class="fw-bold">{{ articulo.nombre }}</div>
            <div class="small text-muted d-flex align-articulos-center gap-1">
              Costo unit. Bs.
              <InputNumber v-model="articulo.costoUnitario" :min="0" mode="decimal"
                :minFractionDigits="2" inputClass="text-end" class="linea-costo" />
            </div>
          </div>

          <div class="d-flex align-articulos-center gap-1">
            <Button type="button" label="-" size="small" severity="secondary" @click="cambiarCantidadItem(idx, -1)" />
            <span class="px-3 fw-bold">{{ articulo.cantidad }}</span>
            <Button type="button" label="+" size="small" severity="info" @click="cambiarCantidadItem(idx, 1)" />
          </div>

          <div class="fw-bold text-end" style="min-width: 95px">
            Bs. {{ (articulo.cantidad * articulo.costoUnitario).toFixed(2) }}
          </div>

          <Button type="button" label="Quitar" severity="danger" text size="small" @click="quitarItem(idx)" />
        </div>
      </div>

      <!-- Forma de pago al proveedor: solo al registrar, no al corregir -->
      <template v-if="!modoEdicion">
        <div>
          <label class="fw-semibold d-block mb-1">Forma de pago al proveedor</label>
          <Select v-model="tipoPago" :options="METODOS_PAGO" optionLabel="etiqueta" optionValue="valor"
            class="w-100" />
        </div>

        <DetallePago ref="panelPago" :tipo-pago="tipoPago" :total="totalCompra" />
      </template>

      <div class="text-end fw-bold fs-5">Total Compra: Bs. {{ totalCompra.toFixed(2) }}</div>

      <div class="d-flex justify-content-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="dialogoVisible = false" />
        <Button type="button" :label="modoEdicion ? 'Guardar cambios' : 'Guardar Compra'"
          :disabled="detalles.length === 0" @click="guardarCambios" />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
/* Costo editable de cada línea, chico para no romper el alto de la fila. */
.linea-costo {
  max-width: 6.5rem;
}

.linea-costo :deep(input) {
  padding: 0.2rem 0.4rem;
  font-size: 0.8rem;
}
</style>
