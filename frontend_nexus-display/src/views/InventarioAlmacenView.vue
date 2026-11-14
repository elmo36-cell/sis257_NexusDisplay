<script setup lang="ts">
import InventarioList from '@/components/inventarioAlmacen/InventarioAlmacenList.vue'
import InventarioSave from '@/components/inventarioAlmacen/InventarioAlmacenSave.vue'
import type { InventarioAlmacen } from '@/models/inventario-almacen'
import { useAuthStore } from '@/stores'
import Button from 'primevue/button'
import { ref } from 'vue'

const authStore = useAuthStore()
const mostrarDialog = ref(false)
const inventarioListRef = ref<typeof InventarioList | null>(null)
const inventarioEdit = ref<InventarioAlmacen | undefined>(undefined)

function handleCreate() {
  inventarioEdit.value = undefined
  mostrarDialog.value = true
}

function handleEdit(inv: InventarioAlmacen) {
  inventarioEdit.value = { ...inv }
  mostrarDialog.value = true
}

function handleCloseDialog() {
  mostrarDialog.value = false
}

function handleGuardar() {
  inventarioListRef.value?.obtenerLista()
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="m-0">Inventario por Almacén</h2>
        <p class="text-muted small m-0 mt-1">
          Consulta y asigna la cantidad de pantallas disponibles en cada sucursal.
        </p>
      </div>
      <Button v-if="authStore.rol === 'ADMIN' || authStore.rol === 'VENDEDOR'" type="button" label="Asignar Stock"
        @click="handleCreate" />
    </div>

    <InventarioList ref="inventarioListRef" @edit="handleEdit" />

    <InventarioSave :mostrar="mostrarDialog" :inventario="inventarioEdit" :modoEdicion="!!inventarioEdit"
      @guardar="handleGuardar" @close="handleCloseDialog" />
  </div>
</template>
