<script setup lang="ts">
import CompraList from '@/components/compra/CompraList.vue'
import CompraSave from '@/components/compra/CompraSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref<boolean>(false)
const listRef = ref<typeof CompraList | null>(null)
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
    <h2>Compras</h2>
    <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    <CompraList ref="listRef" @edit="handleEdit" />
    <CompraSave :mostrar="mostrarDialog" :compra="itemEdit" :modoEdicion="!!itemEdit" @guardar="handleGuardar"
      @close="handleCloseDialog" />
  </div>
</template>
