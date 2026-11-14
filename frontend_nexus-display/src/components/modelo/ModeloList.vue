<script setup lang="ts">
import type { Modelo } from '@/models/modelo'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'modelos'
const modelos = ref<Modelo[]>([])
const modeloDelete = ref<Modelo | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const emit = defineEmits(['edit'])

const modelosFiltrados = computed(() => {
  return modelos.value.filter(
    (m) =>
      m.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      m.marca?.nombre?.toLowerCase().includes(busqueda.value.toLowerCase()),
  )
})

async function obtenerLista() {
  modelos.value = await http.get(ENDPOINT).then((response) => response.data)
}

function emitirEdicion(modelo: Modelo) {
  emit('edit', modelo)
}

function mostrarEliminarConfirm(modelo: Modelo) {
  modeloDelete.value = modelo
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${modeloDelete.value?.id}`)
  obtenerLista()
  mostrarConfirmDialog.value = false
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
        <InputText v-model="busqueda" type="text" placeholder="Buscar por modelo o marca" />
      </InputGroup>
    </div>

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
        <tr v-for="(modelo, index) in modelosFiltrados" :key="modelo.id" class="border-bottom-1 surface-border">
          <td class="p-2">{{ index + 1 }}</td>
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

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de eliminar el modelo <strong>{{ modeloDelete?.nombre }}</strong>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
