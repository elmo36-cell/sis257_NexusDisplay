<script setup lang="ts">
import type { Venta } from '@/models/venta'
import FacturaDialog from '@/components/FacturaDialog.vue'
import DetalleVentaList from '@/components/detalleVenta/DetalleVentaList.vue'
import clienteApi from '@/plugins/axios'
import { useSesionStore } from '@/stores'
import { formatearFecha, formatearMoneda } from '@/helpers'
import { coincideBusqueda } from '@/helpers/busqueda'
import { cargarRegistros } from '@/helpers/listas'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref, watch } from 'vue'
import { usePaginacion } from '@/helpers/paginacion'
import PaginacionTabla from '@/components/PaginacionTabla.vue'

const sesion = useSesionStore()
const RUTA_API = 'ventas'
const ventas = ref<Venta[]>([])
const ventaDelete = ref<Venta | null>(null)
const mostrarConfirmDialog = ref(false)
const busqueda = ref('')
const facturaVisible = ref(false)
const detalleVisible = ref(false)
const ventaDetalle = ref<Venta | null>(null)
const ventaFactura = ref<Venta | null>(null)

const etiquetasPago: Record<string, string> = {
  'TRANSFERENCIA BANCARIA': 'Transferencia',
  'QR / YAPE': 'QR / Yape',
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
}

const puedeFacturar = computed(() => sesion.rol === 'ADMIN' || sesion.rol === 'VENDEDOR')
const columnas = computed(() => (puedeFacturar.value ? 8 : 7))

const ventasVisibles = computed(() => {
  const base =
    sesion.rol === 'CLIENTE'
      ? ventas.value.filter((venta) => venta.idUsuario === sesion.userId)
      : ventas.value

  return base.filter((venta) =>
    coincideBusqueda(busqueda.value, [
      venta.nombreCliente,
      venta.documentoCliente,
      venta.usuario?.nombreUsuario,
      venta.almacen?.nombre,
    ]),
  )
})

// La tabla puede tener cientos de ventas, así que la pagino de 15 en 15 para que
// no se sature la vista. Los filtros de búsqueda se respetan porque pagino la
// lista ya filtrada.
const { paginaActual, totalPaginas, filasPagina, inicioRango, finRango, paginasBloque, irAPagina, irABloque } =
  usePaginacion(ventasVisibles)

watch(busqueda, () => irAPagina(1))

function etiquetaPago(venta: Venta): string {
  if (!venta.tipoPago) return 'No registrado'
  return etiquetasPago[venta.tipoPago] ?? venta.tipoPago
}

// En vez de desplegar la fila dentro de la tabla, abro un diálogo con la tabla
// de líneas (el mismo componente que usa la página de detalles).
function abrirDetalles(venta: Venta) {
  ventaDetalle.value = venta
  detalleVisible.value = true
}

function abrirFactura(venta: Venta) {
  ventaFactura.value = venta
  facturaVisible.value = true
}

async function obtenerLista() {
  await cargarRegistros(ventas, RUTA_API, 'No se pudo cargar el listado de ventas')
}

function mostrarEliminarConfirm(venta: Venta) {
  ventaDelete.value = venta
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  try {
    await clienteApi.delete(`${RUTA_API}/${ventaDelete.value?.id}`)
    await obtenerLista()
    mostrarConfirmDialog.value = false
    notify.success('Venta anulada y stock devuelto al almacén')
  } catch (error) {
    notify.error(mensajeDeError(error, 'No se pudo anular la venta'))
  }
}

onMounted(() => {
  obtenerLista()
})
defineExpose({ obtenerLista })
</script>

<template>
  <div>
    <div v-if="sesion.rol === 'VENDEDOR' && !sesion.tieneSucursal"
      class="alert alert-warning d-flex gap-2 align-articulos-start">
      <i class="pi pi-exclamation-triangle mt-1"></i>
      <div>
        <strong>Sin sucursal asignada.</strong>
        Un administrador debe asignarte una sucursal para que puedas ver y registrar ventas.
      </div>
    </div>
    <div v-else-if="sesion.rol === 'VENDEDOR'" class="branch-scope-note">
      <i class="pi pi-building"></i>
      Mostrando únicamente las ventas de tu sucursal.
    </div>

    <div class="col-12 col-md-6 pl-0 mt-3 mb-3">
      <InputGroup>
        <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
        <InputText v-model="busqueda" type="text" placeholder="Buscar por cliente, NIT/CI, vendedor o sucursal" />
      </InputGroup>
    </div>

    <div class="table-responsive">
      <table class="table nexus-table">
        <thead>
          <tr>
            <th>Venta</th>
            <th class="d-none d-sm-table-cell">Fecha</th>
            <th>Cliente</th>
            <th class="d-none d-md-table-cell">Sucursal</th>
            <th class="d-none d-lg-table-cell">Pago</th>
            <th class="text-end">Total</th>
            <th class="text-center">Líneas</th>
            <th v-if="puedeFacturar" class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="venta in filasPagina" :key="venta.id">
            <tr>
              <td class="cell-strong">
                #{{ venta.id }}
                <div class="cell-muted d-sm-none">{{ formatearFecha(venta.fecha) }}</div>
              </td>
              <td class="d-none d-sm-table-cell cell-muted">{{ formatearFecha(venta.fecha) }}</td>
              <td>
                <div class="cell-strong">{{ venta.nombreCliente || 'S/N' }}</div>
                <div class="cell-muted">{{ venta.documentoCliente || '—' }}</div>
                <div class="cell-muted d-md-none">
                  <i class="pi pi-building me-1"></i>{{ venta.almacen?.nombre || 'Sucursal no registrada' }}
                </div>
              </td>
              <td class="d-none d-md-table-cell">
                <span class="badge bg-light text-dark border">
                  <i class="pi pi-building me-1"></i>{{ venta.almacen?.nombre || '—' }}
                </span>
              </td>
              <td class="d-none d-lg-table-cell">
                <span class="badge bg-info text-dark">{{ etiquetaPago(venta) }}</span>
              </td>
              <td class="text-end cell-strong">{{ formatearMoneda(venta.total) }}</td>
              <td class="text-center">
                <Button icon="pi pi-eye" severity="secondary" text aria-label="Ver líneas de la venta"
                  title="Ver líneas de la venta" @click="abrirDetalles(venta)" />
              </td>
              <td v-if="puedeFacturar" class="text-center text-nowrap">
                <Button icon="pi pi-file-pdf" severity="secondary" text aria-label="Generar factura"
                  title="Generar factura" @click="abrirFactura(venta)" />
                <Button v-if="sesion.esAdmin" icon="pi pi-trash" severity="danger" text aria-label="Anular venta"
                  title="Anular venta" @click="mostrarEliminarConfirm(venta)" />
              </td>
            </tr>

          </template>

          <tr v-if="!ventasVisibles.length">
            <td :colspan="columnas" class="text-center py-4 muted">
              <template v-if="sesion.rol === 'VENDEDOR' && !sesion.tieneSucursal">
                No tienes una sucursal asignada; pide a un administrador que la configure.
              </template>
              <template v-else>No hay ventas registradas.</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginacionTabla :pagina-actual="paginaActual" :total-paginas="totalPaginas"
      :inicio-rango="inicioRango" :fin-rango="finRango" :total-registros="ventasVisibles.length"
      :paginas-bloque="paginasBloque" etiqueta="ventas" aria-label="Paginación de ventas"
      @ir-a-pagina="irAPagina" @ir-a-bloque="irABloque" />

    <Dialog v-model:visible="detalleVisible" :header="`Líneas de la venta #${ventaDetalle?.id ?? ''}`"
      :style="{ width: '56rem' }" :breakpoints="{ '960px': '92vw' }" modal>
      <DetalleVentaList :detalles="ventaDetalle?.detalles ?? []" :con-buscador="false" :mostrar-venta="false"
        texto-vacio="Esta venta no tiene líneas de detalle registradas." />
    </Dialog>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Anular Venta" :style="{ width: '25rem' }" modal>
      <p>
        ¿Estás seguro de anular la venta <strong>#{{ ventaDelete?.id }}</strong> y devolver las
        pantallas al almacén?
      </p>
      <div class="d-flex justify-content-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Anular Venta" severity="danger" @click="eliminar" />
      </div>
    </Dialog>

    <FacturaDialog v-model:visible="facturaVisible" :venta="ventaFactura" />
  </div>
</template>
