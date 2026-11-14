<script setup lang="ts">
import AlmacenList from '@/components/almacen/AlmacenList.vue'
import AlmacenSave from '@/components/almacen/AlmacenSave.vue'
import { useAuthStore } from '@/stores'
import Button from 'primevue/button'
import { ref } from 'vue'
import type { Almacen } from '@/models/almacen'

const authStore = useAuthStore()
const mostrarDialog = ref(false)
const almacenListRef = ref<typeof AlmacenList | null>(null)
const almacenEdit = ref<Almacen | undefined>(undefined)

function handleCreate() {
  almacenEdit.value = undefined
  mostrarDialog.value = true
}

function handleEdit(almacen: Almacen) {
  almacenEdit.value = almacen
  mostrarDialog.value = true
}

function handleCloseDialog() {
  mostrarDialog.value = false
}

function handleGuardar() {
  almacenListRef.value?.obtenerLista()
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="m-0">
          {{ authStore.rol === 'ADMIN' ? 'Administración de Almacenes' : 'Direcciones de Almacenes' }}
        </h2>
        <p class="text-muted small m-0 mt-1">
          Ubicación y dirección de cada almacén registrado.
        </p>
      </div>
      <Button v-if="authStore.rol === 'ADMIN'" label="Crear Almacén" @click="handleCreate" />
    </div>

    <AlmacenList ref="almacenListRef" @edit="handleEdit" />

    <AlmacenSave v-if="authStore.rol === 'ADMIN'" :mostrar="mostrarDialog" :almacen="almacenEdit"
      :modoEdicion="!!almacenEdit" @guardar="handleGuardar" @close="handleCloseDialog" />
  </div>
</template>
