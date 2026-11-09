<script setup lang="ts">
import InventarioAlmacenList from '@/components/inventarioAlmacen/InventarioAlmacenList.vue'
import InventarioAlmacenSave from '@/components/inventarioAlmacen/InventarioAlmacenSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref<boolean>(false)
const listRef = ref<typeof InventarioAlmacenList | null>(null)
const itemEdit = ref<any>(null)

function handleCreate() {
  itemEdit.value = null
  mostrarDialog.value = true
}
function handleEdit(item: any) {
  itemEdit.value = item
  mostrarDialog.value = true
}
function handleCloseDialog() {
  mostrarDialog.value = false
}
function handleGuardar() {
  listRef.value?.obtenerLista()
}
</script>

<template>
  <div class="container py-5 mt-5">
    <h2>Inventario por Almacén</h2>
    <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    <InventarioAlmacenList ref="listRef" @edit="handleEdit" />
    <InventarioAlmacenSave :mostrar="mostrarDialog" :inventario="itemEdit" :modoEdicion="!!itemEdit"
      @guardar="handleGuardar" @close="handleCloseDialog" />
  </div>
</template>
