<script setup lang="ts">
import type { Almacen } from '@/models/almacen'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'almacenes'
const almacenes = ref<Almacen[]>([])
const almacenDelete = ref<Almacen | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const emit = defineEmits(['edit'])

const almacenesFiltrados = computed(() => {
  return almacenes.value.filter(
    (a) =>
      a.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      a.ubicacion?.toLowerCase().includes(busqueda.value.toLowerCase()),
  )
})

async function obtenerLista() {
  almacenes.value = await http.get(ENDPOINT).then((response) => response.data)
}

function emitirEdicion(almacen: Almacen) {
  emit('edit', almacen)
}

function mostrarEliminarConfirm(almacen: Almacen) {
  almacenDelete.value = almacen
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${almacenDelete.value?.id}`)
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
        <InputText v-model="busqueda" type="text" placeholder="Buscar almacén o ubicación" />
      </InputGroup>
    </div>

    <table class="table table-bordered table-striped">
      <thead>
        <tr>
          <th>Nro.</th>
          <th>Nombre</th>
          <th>Ubicación</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(almacen, index) in almacenesFiltrados" :key="almacen.id">
          <td>{{ index + 1 }}</td>
          <td>{{ almacen.nombre }}</td>
          <td>{{ almacen.ubicacion }}</td>
          <td>
            <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(almacen)" />
            <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
              @click="mostrarEliminarConfirm(almacen)" />
          </td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de que deseas eliminar el almacén <b>{{ almacenDelete?.nombre }}</b>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
