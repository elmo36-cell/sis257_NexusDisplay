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
    (modelo) =>
      modelo.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      modelo.marca?.nombre.toLowerCase().includes(busqueda.value.toLowerCase()),
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

    <table class="table table-bordered table-striped">
      <thead>
        <tr>
          <th>Nro.</th>
          <th>Marca</th>
          <th>Nombre del Modelo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(modelo, index) in modelosFiltrados" :key="modelo.id">
          <td>{{ index + 1 }}</td>
          <td>{{ modelo.marca?.nombre }}</td>
          <td>{{ modelo.nombre }}</td>
          <td>
            <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(modelo)" />
            <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
              @click="mostrarEliminarConfirm(modelo)" />
          </td>
        </tr>
        <tr v-if="modelosFiltrados.length === 0">
          <td colspan="4">No se encontraron resultados.</td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de que deseas eliminar el modelo <b>{{ modeloDelete?.nombre }}</b>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
