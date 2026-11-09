<script setup lang="ts">
import DetalleCompraList from '@/components/detalleCompra/DetalleCompraList.vue'
import DetalleCompraSave from '@/components/detalleCompra/DetalleCompraSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref<boolean>(false)
const listRef = ref<typeof DetalleCompraList | null>(null)
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
    <h2>Detalles de Compra</h2>
    <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    <DetalleCompraList ref="listRef" @edit="handleEdit" />
    <DetalleCompraSave :mostrar="mostrarDialog" :detalle="itemEdit" :modoEdicion="!!itemEdit" @guardar="handleGuardar"
      @close="handleCloseDialog" />
  </div>
</template>
