<script setup lang="ts">
import type { Pantalla } from '@/models/pantalla'
import type { Marca } from '@/models/marca'
import type { Modelo } from '@/models/modelo'
import PaginacionTabla from '@/components/PaginacionTabla.vue'
import clienteApi from '@/plugins/axios'
import { coincideBusqueda } from '@/helpers/busqueda'
import { cargarRegistros } from '@/helpers/listas'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { usePaginacion } from '@/helpers/paginacion'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText, Select } from 'primevue'
import { computed, onMounted, ref, watch } from 'vue'

const RUTA_API = 'pantallas'
const pantallas = ref<Pantalla[]>([])
const pantallaDelete = ref<Pantalla | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const marcas = ref<Marca[]>([])
const modelos = ref<Modelo[]>([])
// Los filtros guardan el id elegido; con null el Select muestra todas las marcas
// o todos los modelos, que es lo mismo que no filtrar.
const filtroMarca = ref<number | null>(null)
const filtroModelo = ref<number | null>(null)
const emit = defineEmits(['edit'])

// Si elijo una marca, en el segundo filtro solo dejo sus modelos para no tener
// que buscar entre todos los del catálogo.
const modelosDisponibles = computed(() =>
  filtroMarca.value
    ? modelos.value.filter((modelo) => modelo.idMarca === filtroMarca.value)
    : modelos.value,
)

const pantallasFiltradas = computed(() =>
  pantallas.value.filter(
    (pantalla) =>
      coincideBusqueda(busqueda.value, [
        pantalla.nombre,
        pantalla.codigo,
        pantalla.modelo?.nombre,
        pantalla.modelo?.marca?.nombre,
        pantalla.calidad?.nombre,
        pantalla.categoria?.nombre,
      ]) &&
      (!filtroMarca.value || pantalla.modelo?.idMarca === filtroMarca.value) &&
      (!filtroModelo.value || pantalla.idModelo === filtroModelo.value),
  ),
)

// El catálogo tiene muchas pantallas, así que lo pagino de 15 en 15 con los
// números de página de 10 en 10.
const { paginaActual, totalPaginas, filasPagina, inicioRango, finRango, paginasBloque, irAPagina, irABloque } =
  usePaginacion(pantallasFiltradas)

watch([busqueda, filtroMarca, filtroModelo], () => irAPagina(1))

// Si cambio de marca, quito el modelo elegido porque puede ser de otra marca y
// la tabla quedaría vacía sin que se entienda por qué.
watch(filtroMarca, () => {
  const modeloValido = modelosDisponibles.value.some((modelo) => modelo.id === filtroModelo.value)
  if (!modeloValido) filtroModelo.value = null
})

// Traigo marcas y modelos para los filtros; el backend ya los devuelve con la
// relación marca dentro de cada modelo, así que no tengo que cruzarlos aquí.
async function cargarFiltros() {
  try {
    const [resMarcas, resModelos] = await Promise.all([
      clienteApi.get('marcas'),
      clienteApi.get('modelos'),
    ])
    marcas.value = Array.isArray(resMarcas.data) ? resMarcas.data : []
    modelos.value = Array.isArray(resModelos.data) ? resModelos.data : []
  } catch (error) {
    notify.error(mensajeDeError(error, 'No se pudieron cargar los filtros de marca y modelo'))
  }
}

function obtenerStockTotal(p: Pantalla): number {
  return (p.inventarios ?? []).reduce((acc, inv) => acc + Number(inv.cantidad || 0), 0)
}

async function obtenerLista() {
  await cargarRegistros(pantallas, RUTA_API, 'No se pudo cargar el listado de pantallas')
}

function emitirEdicion(pantalla: Pantalla) {
  emit('edit', pantalla)
}

function mostrarEliminarConfirm(pantalla: Pantalla) {
  pantallaDelete.value = pantalla
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  try {
    await clienteApi.delete(`${RUTA_API}/${pantallaDelete.value?.id}`)
    await obtenerLista()
    mostrarConfirmDialog.value = false
    notify.success('Pantalla eliminada correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'No se pudo eliminar la pantalla'))
  }
}

onMounted(() => {
  obtenerLista()
  cargarFiltros()
})
defineExpose({ obtenerLista })
</script>

<template>
  <div>
    <div class="d-flex flex-wrap gap-2 align-articulos-center mt-3 mb-3">
      <InputGroup class="buscador-pantallas">
        <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
        <InputText v-model="busqueda" type="text" placeholder="Buscar por nombre, código SKU, marca o modelo" />
      </InputGroup>
      <Select v-model="filtroMarca" :options="marcas" optionLabel="nombre" optionValue="id"
        placeholder="Filtrar por marca" showClear filter class="filtro-pantallas" />
      <Select v-model="filtroModelo" :options="modelosDisponibles" optionLabel="nombre" optionValue="id"
        placeholder="Filtrar por modelo" showClear filter class="filtro-pantallas" />
    </div>

    <div class="table-responsive">
      <table class="w-full border-collapse">
        <thead>
          <tr class="surface-200 text-left">
            <th class="p-2">Nro.</th>
            <th class="p-2">Fotografía</th>
            <th class="p-2">Código SKU</th>
            <th class="p-2">Nombre</th>
            <th class="p-2">Marca / Modelo</th>
            <th class="p-2">Calidad</th>
            <th class="p-2">Categoría</th>
            <th class="p-2">Color / Marco</th>
            <th class="p-2">Precio Venta</th>
            <th class="p-2">Stock Total</th>
            <th class="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(pantalla, indice) in filasPagina" :key="pantalla.id" class="border-bottom-1 surface-border">
            <td class="p-2">{{ inicioRango + indice }}</td>
            <td class="p-2">
              <img :src="pantalla.fotografia" :alt="pantalla.nombre" height="45" class="border-round" />
            </td>
            <td class="p-2 font-semibold">{{ pantalla.codigo }}</td>
            <td class="p-2">{{ pantalla.nombre }}</td>
            <td class="p-2">{{ pantalla.modelo?.marca?.nombre }} - {{ pantalla.modelo?.nombre }}</td>
            <td class="p-2">{{ pantalla.calidad?.nombre }}</td>
            <td class="p-2">{{ pantalla.categoria?.nombre }}</td>
            <td class="p-2">{{ pantalla.color }} ({{ pantalla.conMarco ? 'Con Marco' : 'Sin Marco' }})</td>
            <td class="p-2 font-bold">Bs. {{ pantalla.precioVenta }}</td>
            <td class="p-2 font-bold">{{ obtenerStockTotal(pantalla) }} uds.</td>
            <td class="p-2">
              <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(pantalla)" />
              <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
                @click="mostrarEliminarConfirm(pantalla)" />
            </td>
          </tr>
          <tr v-if="pantallasFiltradas.length === 0">
            <td colspan="11" class="p-3 text-center">No se encontraron resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginacionTabla :pagina-actual="paginaActual" :total-paginas="totalPaginas"
      :inicio-rango="inicioRango" :fin-rango="finRango" :total-registros="pantallasFiltradas.length"
      :paginas-bloque="paginasBloque" etiqueta="pantallas" aria-label="Paginación de pantallas"
      @ir-a-pagina="irAPagina" @ir-a-bloque="irABloque" />

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de eliminar la pantalla <strong>{{ pantallaDelete?.nombre }}</strong>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.buscador-pantallas {
  max-width: 28rem;
}

.filtro-pantallas {
  min-width: 13rem;
}
</style>
