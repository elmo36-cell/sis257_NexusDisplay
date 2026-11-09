<script setup lang="ts">
import type { Rol } from '@/models/rol'
import http from '@/plugins/axios'
import { Button, Dialog } from 'primevue'
import { onMounted, ref } from 'vue'

const ENDPOINT = 'roles'
const roles = ref<Rol[]>([])
const rolDelete = ref<Rol | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const emit = defineEmits(['edit'])

async function obtenerLista() {
  roles.value = await http.get(ENDPOINT).then((response) => response.data)
}

function emitirEdicion(rol: Rol) {
  emit('edit', rol)
}

function mostrarEliminarConfirm(rol: Rol) {
  rolDelete.value = rol
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${rolDelete.value?.id}`)
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
    <table class="table table-bordered table-striped mt-3">
      <thead>
        <tr>
          <th>Nro.</th>
          <th>Nombre del Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(rol, index) in roles" :key="rol.id">
          <td>{{ index + 1 }}</td>
          <td>{{ rol.nombre }}</td>
          <td>
            <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(rol)" />
            <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
              @click="mostrarEliminarConfirm(rol)" />
          </td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de eliminar el rol <b>{{ rolDelete?.nombre }}</b>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
