<script setup lang="ts">
import type { Modelo } from '@/models/modelo'
import type { Marca } from '@/models/marca'
import PaginacionTabla from '@/components/PaginacionTabla.vue'
import clienteApi from '@/plugins/axios'
import { coincideBusqueda } from '@/helpers/busqueda'
import { cargarRegistros } from '@/helpers/listas'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { usePaginacion } from '@/helpers/paginacion'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText, Select } from 'primevue'
import { computed, onMounted, ref, watch } from 'vue'

const RUTA_API = 'modelos'
const modelos = ref<Modelo[]>([])
const modeloDelete = ref<Modelo | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const marcas = ref<Marca[]>([])
// Con null el Select queda limpio y muestro todas las marcas.
const filtroMarca = ref<number | null>(null)
const emit = defineEmits(['edit'])

const modelosFiltrados = computed(() =>
  modelos.value.filter(
    (modelo) =>
      coincideBusqueda(busqueda.value, [modelo.nombre, modelo.marca?.nombre]) &&
      (!filtroMarca.value || modelo.idMarca === filtroMarca.value),
  ),
)

// Pagino la lista de modelos de 15 en 15, con los números de página de 10 en 10.
const { paginaActual, totalPaginas, filasPagina, inicioRango, finRango, paginasBloque, irAPagina, irABloque } =
  usePaginacion(modelosFiltrados)

watch([busqueda, filtroMarca], () => irAPagina(1))

async function cargarMarcas() {
  await cargarRegistros(marcas, 'marcas', 'No se pudieron cargar las marcas')
}

async function obtenerLista() {
  await cargarRegistros(modelos, RUTA_API, 'No se pudo cargar la lista de modelos')
}

function emitirEdicion(modelo: Modelo) {
  emit('edit', modelo)
}

function mostrarEliminarConfirm(modelo: Modelo) {
  modeloDelete.value = modelo
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  try {
    await clienteApi.delete(`${RUTA_API}/${modeloDelete.value?.id}`)
    await obtenerLista()
    mostrarConfirmDialog.value = false
    notify.success('Modelo eliminado correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'No se pudo eliminar el modelo'))
  }
}

onMounted(() => {
  obtenerLista()
  cargarMarcas()
})
defineExpose({ obtenerLista })
</script>

<template>
  <div>
    <div class="d-flex flex-wrap gap-2 align-articulos-center mt-3 mb-3">
      <InputGroup class="buscador-modelos">
        <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
        <InputText v-model="busqueda" type="text" placeholder="Buscar por modelo o marca" />
      </InputGroup>
      <Select v-model="filtroMarca" :options="marcas" optionLabel="nombre" optionValue="id"
        placeholder="Filtrar por marca" showClear filter class="filtro-marca" />
    </div>

    <div class="table-responsive">
      <table class="w-full border-collapse">
        <thead>
          <tr class="surface-200 text-left">
            <th class="p-2">Nro.</th>
            <th class="p-2">Fotografía</th>
            <th class="p-2">Marca</th>
            <th class="p-2">Nombre del Modelo</th>
            <th class="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(modelo, indice) in filasPagina" :key="modelo.id" class="border-bottom-1 surface-border">
            <td class="p-2">{{ inicioRango + indice }}</td>
            <td class="p-2">
              <img :src="modelo.fotografia" :alt="modelo.nombre" height="45" class="border-round" />
            </td>
            <td class="p-2">{{ modelo.marca?.nombre }}</td>
            <td class="p-2 font-semibold">{{ modelo.nombre }}</td>
            <td class="p-2">
              <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(modelo)" />
              <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
                @click="mostrarEliminarConfirm(modelo)" />
            </td>
          </tr>
          <tr v-if="modelosFiltrados.length === 0">
            <td colspan="5" class="p-3 text-center">No se encontraron resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginacionTabla :pagina-actual="paginaActual" :total-paginas="totalPaginas"
      :inicio-rango="inicioRango" :fin-rango="finRango" :total-registros="modelosFiltrados.length"
      :paginas-bloque="paginasBloque" etiqueta="modelos" aria-label="Paginación de modelos"
      @ir-a-pagina="irAPagina" @ir-a-bloque="irABloque" />

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de eliminar el modelo <strong>{{ modeloDelete?.nombre }}</strong>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.buscador-modelos {
  max-width: 28rem;
}

.filtro-marca {
  min-width: 13rem;
}
</style>
