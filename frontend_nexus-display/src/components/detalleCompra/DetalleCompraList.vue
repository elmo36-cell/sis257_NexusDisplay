<script setup lang="ts">
import type { DetalleCompra } from '@/models/detalle-compra'
import PaginacionTabla from '@/components/PaginacionTabla.vue'
import { formatearFecha, formatearMoneda } from '@/helpers'
import { coincideBusqueda } from '@/helpers/busqueda'
import { usePaginacion } from '@/helpers/paginacion'
import { Button, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

// Igual que en ventas: la tabla recibe las líneas por props para poder usarla en
// la página de detalles y en el diálogo del ojo de Compras.
const props = withDefaults(
  defineProps<{
    detalles: DetalleCompra[]
    conBuscador?: boolean
    mostrarCompra?: boolean
    editable?: boolean
    textoVacio?: string
  }>(),
  {
    conBuscador: true,
    mostrarCompra: true,
    editable: false,
    textoVacio: 'No hay detalles de compra registrados todavía.',
  },
)

const emit = defineEmits<{ editar: [detalle: DetalleCompra] }>()

const busqueda = ref('')

const columnas = computed(() => {
  let total = 6
  if (props.mostrarCompra) total += 3
  if (props.editable) total += 1
  return total
})

const detallesFiltrados = computed(() =>
  props.detalles.filter((det) =>
    coincideBusqueda(busqueda.value, [
      det.pantalla?.nombre,
      det.pantalla?.codigo,
      det.compra?.proveedor?.nombre,
      String(det.idCompra ?? det.compra?.id ?? ''),
    ]),
  ),
)

// La página de detalles trae todas las líneas de compra, así que la pagino de 15
// en 15 con los números de página de 10 en 10.
const { paginaActual, totalPaginas, filasPagina, inicioRango, finRango, paginasBloque, irAPagina, irABloque } =
  usePaginacion(detallesFiltrados)

watch(busqueda, () => irAPagina(1))

const totalInvertido = computed(() =>
  detallesFiltrados.value.reduce(
    (acc, det) => acc + Number(det.subtotal || Number(det.cantidad) * Number(det.costoUnitario)),
    0,
  ),
)
</script>

<template>
  <div>
    <div v-if="conBuscador" class="col-12 col-md-6 pl-0 mt-3 mb-3">
      <InputText v-model="busqueda" type="text"
        placeholder="Buscar por pantalla, código SKU, proveedor o Nro. de compra..." class="w-100" />
    </div>

    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th>Nro.</th>
            <th v-if="mostrarCompra">Compra #</th>
            <th v-if="mostrarCompra">Proveedor</th>
            <th v-if="mostrarCompra">Fecha</th>
            <th>Código SKU</th>
            <th>Pantalla</th>
            <th>Cantidad</th>
            <th>Costo Unitario</th>
            <th>Subtotal</th>
            <th v-if="editable" class="text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(det, indice) in filasPagina" :key="det.id">
            <td>{{ inicioRango + indice }}</td>
            <td v-if="mostrarCompra" class="fw-bold">#{{ det.idCompra || det.compra?.id }}</td>
            <td v-if="mostrarCompra">{{ det.compra?.proveedor?.nombre || '—' }}</td>
            <td v-if="mostrarCompra" class="cell-muted">{{ formatearFecha(det.compra?.fecha) }}</td>
            <td>{{ det.pantalla?.codigo || '-' }}</td>
            <td class="cell-strong">{{ det.pantalla?.nombre }}</td>
            <td>
              <span class="badge bg-success text-white px-3 py-2">
                {{ det.cantidad }} {{ Number(det.cantidad) === 1 ? 'unidad' : 'unidades' }}
              </span>
            </td>
            <td>{{ formatearMoneda(det.costoUnitario) }}</td>
            <td class="cell-strong">
              {{ formatearMoneda(det.subtotal || Number(det.cantidad) * Number(det.costoUnitario)) }}
            </td>
            <td v-if="editable" class="text-center">
              <Button icon="pi pi-pencil" severity="secondary" text aria-label="Editar línea de compra"
                title="Editar línea" @click="emit('editar', det)" />
            </td>
          </tr>
          <tr v-if="!detallesFiltrados.length">
            <td :colspan="columnas" class="text-center py-4 muted">{{ textoVacio }}</td>
          </tr>
        </tbody>
        <tfoot v-if="detallesFiltrados.length">
          <tr>
            <td :colspan="columnas - 1" class="text-end fw-semibold">Total invertido</td>
            <td class="cell-strong">{{ formatearMoneda(totalInvertido) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <PaginacionTabla :pagina-actual="paginaActual" :total-paginas="totalPaginas"
      :inicio-rango="inicioRango" :fin-rango="finRango" :total-registros="detallesFiltrados.length"
      :paginas-bloque="paginasBloque" etiqueta="líneas" aria-label="Paginación de líneas de compra"
      @ir-a-pagina="irAPagina" @ir-a-bloque="irABloque" />
  </div>
</template>
