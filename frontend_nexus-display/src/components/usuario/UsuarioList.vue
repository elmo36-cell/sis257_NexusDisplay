<script setup lang="ts">
import type { Usuario } from '@/models/usuario'
import http from '@/plugins/axios'
import { Button, Dialog } from 'primevue'
import { onMounted, ref } from 'vue'

const ENDPOINT = 'usuarios'
const usuarios = ref<Usuario[]>([])
const usuarioDelete = ref<Usuario | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const emit = defineEmits(['edit'])

async function obtenerLista() {
  usuarios.value = await http.get(ENDPOINT).then((response) => response.data)
}

function emitirEdicion(usuario: Usuario) {
  emit('edit', usuario)
}

function mostrarEliminarConfirm(usuario: Usuario) {
  usuarioDelete.value = usuario
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${usuarioDelete.value?.id}`)
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
          <th>Usuario</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(u, index) in usuarios" :key="u.id">
          <td>{{ index + 1 }}</td>
          <td>{{ u.usuario }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.rol?.nombre }}</td>
          <td>
            <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(u)" />
            <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
              @click="mostrarEliminarConfirm(u)" />
          </td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de eliminar al usuario <b>{{ usuarioDelete?.usuario }}</b>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
