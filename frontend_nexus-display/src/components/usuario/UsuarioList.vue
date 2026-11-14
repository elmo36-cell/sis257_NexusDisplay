<script setup lang="ts">
import type { Usuario } from '@/models/usuario'
import http from '@/plugins/axios'
import { useAuthStore } from '@/stores'
import { Button, Dialog, InputText, Select } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const authStore = useAuthStore()
const ENDPOINT = 'usuarios'
const usuarios = ref<Usuario[]>([])
const usuarioDelete = ref<Usuario | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const filtroRol = ref<string | null>(null)
const emit = defineEmits(['edit'])

const opcionesFiltroRol = [
  { label: 'ADMIN', value: 'ADMIN' },
  { label: 'VENDEDOR', value: 'VENDEDOR' },
  { label: 'CLIENTE', value: 'CLIENTE' },
]

const usuariosFiltrados = computed(() => {
  return usuarios.value.filter((u) => {
    const q = busqueda.value.toLowerCase()
    const coincideTexto =
      u.nombreUsuario.toLowerCase().includes(q) ||
      u.correo.toLowerCase().includes(q) ||
      (u.telefono ?? '').toLowerCase().includes(q)

    const coincideRol = !filtroRol.value || u.rol === filtroRol.value
    return coincideTexto && coincideRol
  })
})

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
    <div class="row g-3 mt-2 mb-3">
      <div class="col-12 col-md-6">
        <InputText v-model="busqueda" type="text" placeholder="Buscar por usuario, correo o teléfono..."
          class="w-100" />
      </div>
      <div v-if="authStore.rol === 'ADMIN'" class="col-12 col-md-4">
        <Select v-model="filtroRol" :options="opcionesFiltroRol" optionLabel="label" optionValue="value"
          placeholder="Filtrar por Rol" showClear class="w-100" />
      </div>
    </div>

    <table class="table table-hover align-middle bg-white shadow-sm rounded">
      <thead class="table-dark">
        <tr>
          <th>Nro.</th>
          <th>Nombre de Usuario</th>
          <th>Correo Electrónico</th>
          <th>Teléfono / Celular</th>
          <th>Rol</th>
          <th>Estado</th>
          <th v-if="authStore.rol === 'ADMIN'">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(u, index) in usuariosFiltrados" :key="u.id">
          <td>{{ index + 1 }}</td>
          <td class="fw-bold text-dark">{{ u.nombreUsuario }}</td>
          <td>{{ u.correo }}</td>
          <td>{{ u.telefono || 'Sin registrar' }}</td>
          <td>
            <span class="badge px-3 py-2" :class="{
              'bg-primary text-white': u.rol === 'ADMIN',
              'bg-success text-white': u.rol === 'VENDEDOR',
              'bg-secondary text-white': u.rol === 'CLIENTE',
            }">
              {{ u.rol }}
            </span>
          </td>
          <td>
            <span class="badge" :class="u.activo ? 'bg-success' : 'bg-danger'">
              {{ u.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          <td v-if="authStore.rol === 'ADMIN'">
            <Button label="Editar" text @click="emitirEdicion(u)" />
            <Button label="Eliminar" text severity="danger" @click="mostrarEliminarConfirm(u)" />
          </td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>
        ¿Estás seguro de eliminar al usuario <strong>{{ usuarioDelete?.nombreUsuario }}</strong>?
      </p>
      <div class="d-flex justify-content-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
