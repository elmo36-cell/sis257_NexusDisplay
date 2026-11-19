<script setup lang="ts">
import type { Compra } from '@/models/compra'
import type { Almacen } from '@/models/almacen'
import FacturaCompraDialog from '@/components/compra/FacturaCompraDialog.vue'
import CompraSave from '@/components/compra/CompraSave.vue'
import DetalleCompraList from '@/components/detalleCompra/DetalleCompraList.vue'
import clienteApi from '@/plugins/axios'
import { useSesionStore } from '@/stores'
import { formatearFecha, formatearMoneda } from '@/helpers'
import { coincideBusqueda } from '@/helpers/busqueda'
import { cargarRegistros } from '@/helpers/listas'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { usePaginacion } from '@/helpers/paginacion'
import PaginacionTabla from '@/components/PaginacionTabla.vue'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText, Select } from 'primevue'
import { computed, onMounted, ref, watch } from 'vue'

const sesion = useSesionStore()
const RUTA_API = 'compras'
const compras = ref<Compra[]>([])
const compraDelete = ref<Compra | null>(null)
const mostrarConfirmDialog = ref(false)
const busqueda = ref('')
const facturaVisible = ref(false)
const detalleVisible = ref(false)
const compraDetalle = ref<Compra | null>(null)
const compraFactura = ref<Compra | null>(null)
const almacenes = ref<Almacen[]>([])
// Filtro por sucursal: guardo el id del almacén y lo comparo con el almacén de
// destino que trae cada compra; null significa "todas las sucursales".
const filtroSucursal = ref<number | null>(null)
const editorVisible = ref(false)
const compraEdicion = ref<Compra | null>(null)

const comprasFiltradas = computed(() =>
  compras.value.filter(
    (compra) =>
      coincideBusqueda(busqueda.value, [
        compra.proveedor?.nombre,
        compra.almacen?.nombre,
        compra.usuario?.nombreUsuario,
      ]) && (!filtroSucursal.value || compra.almacen?.id === filtroSucursal.value),
  ),
)

// Pagino las compras de 15 en 15 con los números de página de 10 en 10, como el
// resto de los listados.
const { paginaActual, totalPaginas, filasPagina, inicioRango, finRango, paginasBloque, irAPagina, irABloque } =
  usePaginacion(comprasFiltradas)

watch([busqueda, filtroSucursal], () => irAPagina(1))

async function cargarAlmacenes() {
  await cargarRegistros(almacenes, 'almacenes', 'No se pudieron cargar las sucursales')
}

// Igual que en ventas: el ojo abre un diálogo con la tabla de líneas en vez de
// desplegar la fila.
function abrirDetalles(compra: Compra) {
  compraDetalle.value = compra
  detalleVisible.value = true
}

// El lápiz abre la compra en modo edición: el admin corrige proveedor, sucursal,
// fecha y líneas, y el backend reajusta el stock.
function abrirEdicion(compra: Compra) {
  compraEdicion.value = compra
  editorVisible.value = true
}

// Abro la factura de compra con los datos del proveedor; desde ahí se puede
// corregir la fecha de la compra.
function abrirFactura(compra: Compra) {
  compraFactura.value = compra
  facturaVisible.value = true
}

async function obtenerLista() {
  await cargarRegistros(compras, RUTA_API, 'No se pudo cargar el listado de compras')
}

function mostrarEliminarConfirm(compra: Compra) {
  compraDelete.value = compra
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  try {
    await clienteApi.delete(`${RUTA_API}/${compraDelete.value?.id}`)
    await obtenerLista()
    mostrarConfirmDialog.value = false
    notify.success('Compra anulada correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'No se puede anular la compra'))
  }
}

onMounted(() => {
  obtenerLista()
  cargarAlmacenes()
})
defineExpose({ obtenerLista })
</script>

<template>
  <div>
    <div class="d-flex flex-wrap gap-2 align-articulos-center mt-3 mb-3">
      <InputGroup class="buscador-compras">
        <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
        <InputText v-model="busqueda" type="text" placeholder="Buscar por proveedor, almacén o usuario" />
      </InputGroup>
      <Select v-model="filtroSucursal" :options="almacenes" optionLabel="nombre" optionValue="id"
        placeholder="Filtrar por sucursal" showClear filter class="filtro-sucursal" />
    </div>

    <div class="table-responsive">
      <table class="table nexus-table">
        <thead>
          <tr>
            <th>Compra</th>
            <th class="d-none d-sm-table-cell">Fecha</th>
            <th>Proveedor</th>
            <th class="d-none d-md-table-cell">Almacén destino</th>
            <th class="d-none d-lg-table-cell">Registrado por</th>
            <th class="text-end">Total</th>
            <th class="text-center">Líneas</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="compra in filasPagina" :key="compra.id">
            <tr>
              <td class="cell-strong">
                #{{ compra.id }}
                <div class="cell-muted d-sm-none">{{ formatearFecha(compra.fecha) }}</div>
              </td>
              <td class="d-none d-sm-table-cell cell-muted">{{ formatearFecha(compra.fecha) }}</td>
              <td class="cell-strong">
                {{ compra.proveedor?.nombre || '—' }}
                <div class="cell-muted">{{ compra.proveedor?.nit || 'Sin NIT' }}</div>
              </td>
              <td class="d-none d-md-table-cell">{{ compra.almacen?.nombre || '—' }}</td>
              <td class="d-none d-lg-table-cell">{{ compra.usuario?.nombreUsuario || '—' }}</td>
              <td class="text-end cell-strong">{{ formatearMoneda(compra.total) }}</td>
              <td class="text-center">
                <Button icon="pi pi-eye" severity="secondary" text aria-label="Ver líneas de la compra"
                  title="Ver líneas de la compra" @click="abrirDetalles(compra)" />
              </td>
              <td class="text-center text-nowrap">
                <Button v-if="sesion.esAdmin" icon="pi pi-pencil" severity="secondary" text
                  aria-label="Editar compra" title="Editar compra" @click="abrirEdicion(compra)" />
                <Button icon="pi pi-file-pdf" severity="secondary" text aria-label="Ver factura de compra"
                  title="Factura de compra" @click="abrirFactura(compra)" />
                <Button icon="pi pi-trash" severity="danger" text aria-label="Anular compra"
                  @click="mostrarEliminarConfirm(compra)" />
              </td>
            </tr>

          </template>

          <tr v-if="!comprasFiltradas.length">
            <td colspan="8" class="text-center py-4 muted">No hay compras que coincidan con el filtro.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginacionTabla :pagina-actual="paginaActual" :total-paginas="totalPaginas"
      :inicio-rango="inicioRango" :fin-rango="finRango" :total-registros="comprasFiltradas.length"
      :paginas-bloque="paginasBloque" etiqueta="compras" aria-label="Paginación de compras"
      @ir-a-pagina="irAPagina" @ir-a-bloque="irABloque" />

    <Dialog v-model:visible="mostrarConfirmDialog" header="Anular Compra" :style="{ width: '25rem' }" modal>
      <p>
        ¿Deseas anular la compra <strong>#{{ compraDelete?.id }}</strong> y descontar el stock
        ingresado?
      </p>
      <div class="d-flex justify-content-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Anular Compra" severity="danger" @click="eliminar" />
      </div>
    </Dialog>

    <Dialog v-model:visible="detalleVisible" :header="`Líneas de la compra #${compraDetalle?.id ?? ''}`"
      :style="{ width: '56rem' }" :breakpoints="{ '960px': '92vw' }" modal>
      <DetalleCompraList :detalles="compraDetalle?.detalles ?? []" :con-buscador="false" :mostrar-compra="false"
        texto-vacio="Esta compra no tiene líneas de detalle registradas." />
    </Dialog>

    <FacturaCompraDialog v-model:visible="facturaVisible" :compra="compraFactura"
      @actualizada="obtenerLista" />

    <CompraSave :mostrar="editorVisible" :compra="compraEdicion" modo-edicion
      @guardar="obtenerLista" @close="editorVisible = false" />
  </div>
</template>

<style scoped>
.buscador-compras {
  max-width: 28rem;
}

.filtro-sucursal {
  min-width: 14rem;
}
</style>
