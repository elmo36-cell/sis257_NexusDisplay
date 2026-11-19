<script setup lang="ts">
import type { InventarioAlmacen } from '@/models/inventario-almacen'
import type { Categoria } from '@/models/categoria'
import clienteApi from '@/plugins/axios'
import { useSesionStore } from '@/stores'
import { coincideBusqueda } from '@/helpers/busqueda'
import { cargarRegistros } from '@/helpers/listas'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText, Select } from 'primevue'
import { computed, onMounted, ref, watch } from 'vue'
import { usePaginacion } from '@/helpers/paginacion'
import PaginacionTabla from '@/components/PaginacionTabla.vue'

const sesion = useSesionStore()
const RUTA_API = 'inventario-almacen'
// Desde esta cantidad para abajo muestro el stock en rojo, para avisar que queda poco.
const UMBRAL_STOCK_BAJO = 3
const inventarios = ref<InventarioAlmacen[]>([])
const inventarioDelete = ref<InventarioAlmacen | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const categorias = ref<Categoria[]>([])
// Uso number | null porque el Select devuelve el id de la categoría y con la "x"
// para limpiar el filtro regresa null; null significa "mostrar todas".
const filtroCategoria = ref<number | null>(null)
const emit = defineEmits(['edit'])

// Filtro la lista por el texto que escribe el usuario y, si eligió una categoría,
// solo dejo los registros cuya pantalla pertenece a esa categoría (el id viene dentro
// de pantalla.categoria porque el backend ya trae la relación).
const inventariosFiltrados = computed(() =>
  inventarios.value.filter(
    (inv) =>
      coincideBusqueda(busqueda.value, [
        inv.pantalla?.nombre,
        inv.pantalla?.codigo,
        inv.almacen?.nombre,
      ]) &&
      (!filtroCategoria.value || inv.pantalla?.idCategoria === filtroCategoria.value),
  ),
)

// Pagino el inventario: 15 registros por página y los números de página de 10
// en 10, para no tener que ver cientos de filas de golpe.
const { paginaActual, totalPaginas, filasPagina, inicioRango, finRango, paginasBloque, irAPagina, irABloque } =
  usePaginacion(inventariosFiltrados)

// Al cambiar el buscador o la categoría vuelvo a la primera página.
watch([busqueda, filtroCategoria], () => irAPagina(1))

// Traigo las categorías desde la misma tabla que usa el catálogo para no dejar
// los ids escritos a mano (si mañana agregan una categoría, aparece sola).
async function cargarCategorias() {
  await cargarRegistros(categorias, 'categorias', 'No se pudieron cargar las categorías')
}

async function obtenerLista() {
  await cargarRegistros(inventarios, RUTA_API, 'No se pudo cargar el inventario')
}

function emitirEdicion(inv: InventarioAlmacen) {
  emit('edit', inv)
}

function mostrarEliminarConfirm(inv: InventarioAlmacen) {
  inventarioDelete.value = inv
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  try {
    await clienteApi.delete(`${RUTA_API}/${inventarioDelete.value?.id}`)
    await obtenerLista()
    mostrarConfirmDialog.value = false
    notify.success('Registro de inventario eliminado')
  } catch (error) {
    notify.error(mensajeDeError(error, 'No se pudo eliminar el registro de inventario'))
  }
}

onMounted(() => {
  obtenerLista()
  cargarCategorias()
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
        Un administrador debe asignarte una sucursal para que veas el inventario de tu tienda.
      </div>
    </div>
    <div v-else-if="sesion.rol === 'VENDEDOR'" class="branch-scope-note">
      <i class="pi pi-building"></i>
      Mostrando únicamente el inventario de tu sucursal.
    </div>

    <div class="d-flex flex-wrap gap-2 align-articulos-center mt-3 mb-3">
      <InputGroup class="buscador-inventario">
        <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
        <InputText v-model="busqueda" type="text" placeholder="Buscar por pantalla, SKU o almacén" />
      </InputGroup>
      <Select v-model="filtroCategoria" :options="categorias" optionLabel="nombre" optionValue="id"
        placeholder="Filtrar por categoría" showClear filter class="filtro-categoria" />
    </div>

    <div class="table-responsive">
      <table class="w-full border-collapse">
        <thead>
          <tr class="surface-200 text-left">
            <th class="p-2">Nro.</th>
            <th class="p-2">Foto</th>
            <th class="p-2">Almacén / Sucursal</th>
            <th class="p-2">Código SKU</th>
            <th class="p-2">Pantalla</th>
            <th class="p-2">Cantidad Disponible</th>
            <th v-if="sesion.esAdmin" class="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(inv, indice) in filasPagina" :key="inv.id" class="border-bottom-1 surface-border">
            <td class="p-2">{{ inicioRango + indice }}</td>
            <td class="p-2">
              <img :src="inv.pantalla?.fotografia" height="40" class="border-round" />
            </td>
            <td class="p-2 font-semibold">{{ inv.almacen?.nombre }}</td>
            <td class="p-2">{{ inv.pantalla?.codigo }}</td>
            <td class="p-2">{{ inv.pantalla?.nombre }}</td>
            <td class="p-2 font-bold"
              :class="inv.cantidad <= UMBRAL_STOCK_BAJO ? 'text-red-500' : 'text-green-600'">
              {{ inv.cantidad }} uds.
            </td>
            <td v-if="sesion.esAdmin" class="p-2">
              <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(inv)" />
              <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
                @click="mostrarEliminarConfirm(inv)" />
            </td>
          </tr>
          <tr v-if="!inventariosFiltrados.length">
            <td colspan="7" class="text-center py-4 muted">No hay stock asignado a almacenes.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginacionTabla :pagina-actual="paginaActual" :total-paginas="totalPaginas"
      :inicio-rango="inicioRango" :fin-rango="finRango" :total-registros="inventariosFiltrados.length"
      :paginas-bloque="paginasBloque" etiqueta="registros" aria-label="Paginación del inventario"
      @ir-a-pagina="irAPagina" @ir-a-bloque="irABloque" />

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de eliminar este registro de inventario?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.buscador-inventario {
  max-width: 28rem;
}

.filtro-categoria {
  min-width: 14rem;
}
</style>
