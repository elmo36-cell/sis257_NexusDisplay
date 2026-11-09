<script setup lang="ts">
import DetalleVentaList from '@/components/detalleVenta/DetalleVentaList.vue'
import DetalleVentaSave from '@/components/detalleVenta/DetalleVentaSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref<boolean>(false)
const listRef = ref<typeof DetalleVentaList | null>(null)
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
    <h2>Detalles de Venta</h2>
    <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    <DetalleVentaList ref="listRef" @edit="handleEdit" />
    <DetalleVentaSave :mostrar="mostrarDialog" :detalle="itemEdit" :modoEdicion="!!itemEdit" @guardar="handleGuardar"
      @close="handleCloseDialog" />
  </div>
</template>
