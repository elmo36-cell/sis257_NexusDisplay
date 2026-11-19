<script setup lang="ts">
import type { DetalleVenta } from '@/models/detalle-venta'
import PaginacionTabla from '@/components/PaginacionTabla.vue'
import { formatearMoneda } from '@/helpers'
import { coincideBusqueda } from '@/helpers/busqueda'
import { usePaginacion } from '@/helpers/paginacion'
import { Button, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

// Antes esta tabla pedía los datos a la API por su cuenta, así que solo servía
// para la página de detalles. Ahora recibe las líneas por props: la uso tanto en
// esa página como en el diálogo del ojo de Ventas, y no repito la tabla.
const props = withDefaults(
  defineProps<{
    detalles: DetalleVenta[]
    conBuscador?: boolean
    mostrarVenta?: boolean
    editable?: boolean
    textoVacio?: string
  }>(),
  {
    conBuscador: true,
    mostrarVenta: true,
    editable: false,
    textoVacio: 'No hay detalles de venta registrados todavía.',
  },
)

const emit = defineEmits<{ editar: [detalle: DetalleVenta] }>()

const busqueda = ref('')

const columnas = computed(() => {
  let total = 6
  if (props.mostrarVenta) total += 2
  if (props.editable) total += 1
  return total
})

const detallesFiltrados = computed(() =>
  props.detalles.filter((det) =>
    coincideBusqueda(busqueda.value, [
      det.pantalla?.nombre,
      det.pantalla?.codigo,
      det.venta?.nombreCliente,
      String(det.idVenta ?? det.venta?.id ?? ''),
    ]),
  ),
)

// La página de detalles trae todas las líneas de venta, que son muchas, así que
// la pagino de 15 en 15. En el diálogo del ojo casi nunca pasa de una página y
// la barra ni aparece.
const { paginaActual, totalPaginas, filasPagina, inicioRango, finRango, paginasBloque, irAPagina, irABloque } =
  usePaginacion(detallesFiltrados)

watch(busqueda, () => irAPagina(1))
</script>

<template>
  <div>
    <div v-if="conBuscador" class="col-12 col-md-6 pl-0 mt-3 mb-3">
      <InputText v-model="busqueda" type="text"
        placeholder="Buscar por pantalla, código SKU, cliente o Nro. de venta..." class="w-100" />
    </div>

    <div class="table-responsive">
      <table class="table table-hover align-middle bg-white shadow-sm rounded">
        <thead class="table-dark">
          <tr>
            <th>Nro.</th>
            <th v-if="mostrarVenta">Venta #</th>
            <th v-if="mostrarVenta">Cliente</th>
            <th>Código SKU</th>
            <th>Pantalla Vendida</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Subtotal</th>
            <th v-if="editable" class="text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(det, indice) in filasPagina" :key="det.id">
            <td>{{ inicioRango + indice }}</td>
            <td v-if="mostrarVenta" class="fw-bold">#{{ det.idVenta || det.venta?.id }}</td>
            <td v-if="mostrarVenta">{{ det.venta?.nombreCliente || 'S/N' }}</td>
            <td>{{ det.pantalla?.codigo || '-' }}</td>
            <td class="fw-semibold text-dark">{{ det.pantalla?.nombre }}</td>
            <td>
              <span class="badge bg-info text-dark px-3 py-2 fw-bold">
                {{ det.cantidad }} {{ Number(det.cantidad) === 1 ? 'unidad' : 'unidades' }}
              </span>
            </td>
            <td>{{ formatearMoneda(det.precioUnitario) }}</td>
            <td class="fw-bold text-primary">
              {{ formatearMoneda(det.subtotal || Number(det.cantidad) * Number(det.precioUnitario)) }}
            </td>
            <td v-if="editable" class="text-center">
              <Button icon="pi pi-pencil" severity="secondary" text aria-label="Editar línea de venta"
                title="Editar línea" @click="emit('editar', det)" />
            </td>
          </tr>
          <tr v-if="!detallesFiltrados.length">
            <td :colspan="columnas" class="text-center py-4">{{ textoVacio }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginacionTabla :pagina-actual="paginaActual" :total-paginas="totalPaginas"
      :inicio-rango="inicioRango" :fin-rango="finRango" :total-registros="detallesFiltrados.length"
      :paginas-bloque="paginasBloque" etiqueta="líneas" aria-label="Paginación de líneas de venta"
      @ir-a-pagina="irAPagina" @ir-a-bloque="irABloque" />
  </div>
</template>
