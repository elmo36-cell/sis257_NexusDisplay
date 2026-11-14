<script setup lang="ts">
import type { Almacen } from '@/models/almacen'
import http from '@/plugins/axios'
import { useAuthStore } from '@/stores'
import { Button, Dialog, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const authStore = useAuthStore()
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
      a.direccion.toLowerCase().includes(busqueda.value.toLowerCase()),
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
    <div class="col-12 col-md-6 pl-0 mt-3 mb-3">
      <InputText v-model="busqueda" type="text" placeholder="Buscar almacén o dirección..." class="w-100" />
    </div>

    <table class="table table-hover align-middle bg-white shadow-sm rounded">
      <thead class="table-dark">
        <tr>
          <th>Nro.</th>
          <th>Nombre del Almacén</th>
          <th>Dirección</th>
          <th v-if="authStore.rol === 'ADMIN'">Teléfono</th>
          <th v-if="authStore.rol === 'ADMIN'">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(almacen, index) in almacenesFiltrados" :key="almacen.id">
          <td>{{ index + 1 }}</td>
          <td class="fw-bold text-dark">{{ almacen.nombre }}</td>
          <td>{{ almacen.direccion }}</td>
          <td v-if="authStore.rol === 'ADMIN'">{{ almacen.telefono || 'Sin teléfono' }}</td>
          <td v-if="authStore.rol === 'ADMIN'">
            <Button label="Editar" text @click="emitirEdicion(almacen)" />
            <Button label="Eliminar" text severity="danger" @click="mostrarEliminarConfirm(almacen)" />
          </td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de eliminar el almacén <strong>{{ almacenDelete?.nombre }}</strong>?</p>
      <div class="d-flex justify-content-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
