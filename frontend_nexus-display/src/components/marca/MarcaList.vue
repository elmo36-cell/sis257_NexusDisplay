<script setup lang="ts">
import type { Marca } from '@/models/marca'
import clienteApi from '@/plugins/axios'
import { coincideBusqueda } from '@/helpers/busqueda'
import { cargarRegistros } from '@/helpers/listas'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const RUTA_API = 'marcas'
const marcas = ref<Marca[]>([])
const marcaDelete = ref<Marca | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const emit = defineEmits(['edit'])

const marcasFiltradas = computed(() =>
  marcas.value.filter((marca) => coincideBusqueda(busqueda.value, [marca.nombre])),
)

async function obtenerLista() {
  await cargarRegistros(marcas, RUTA_API, 'No se pudo cargar la lista de marcas')
}

function emitirEdicion(marca: Marca) {
  emit('edit', marca)
}

function mostrarEliminarConfirm(marca: Marca) {
  marcaDelete.value = marca
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  try {
    await clienteApi.delete(`${RUTA_API}/${marcaDelete.value?.id}`)
    await obtenerLista()
    mostrarConfirmDialog.value = false
    notify.success('Marca eliminada correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'No se pudo eliminar la marca'))
  }
}

onMounted(() => {
  obtenerLista()
})
defineExpose({ obtenerLista })
</script>

<template>
  <div>
    <div class="col-7 pl-0 mt-3 mb-3">
      <InputGroup>
        <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
        <InputText v-model="busqueda" type="text" placeholder="Buscar por nombre de marca" />
      </InputGroup>
    </div>

    <div class="table-responsive">
      <table class="w-full border-collapse">
        <thead>
          <tr class="surface-200 text-left">
            <th class="p-2">Nro.</th>
            <th class="p-2">Logo</th>
            <th class="p-2">Nombre</th>
            <th class="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(marca, indice) in marcasFiltradas" :key="marca.id" class="border-bottom-1 surface-border">
            <td class="p-2">{{ indice + 1 }}</td>
            <td class="p-2">
              <img :src="marca.fotografia" :alt="marca.nombre" width="100" height="40"
                style="width: 100px; height: 40px; object-fit: contain; display: block;" class="border-round" />
            </td>
            <td class="p-2 font-semibold">{{ marca.nombre }}</td>
            <td class="p-2">
              <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(marca)" />
              <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
                @click="mostrarEliminarConfirm(marca)" />
            </td>
          </tr>
          <tr v-if="marcasFiltradas.length === 0">
            <td colspan="4" class="p-3 text-center">No se encontraron resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de que deseas eliminar la marca <strong>{{ marcaDelete?.nombre }}</strong>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
