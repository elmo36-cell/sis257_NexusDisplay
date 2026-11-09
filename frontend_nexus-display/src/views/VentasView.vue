<script setup lang="ts">
import VentaList from '@/components/venta/VentaList.vue'
import VentaSave from '@/components/venta/VentaSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref<boolean>(false)
const listRef = ref<typeof VentaList | null>(null)
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
    <h2>Ventas</h2>
    <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    <VentaList ref="listRef" @edit="handleEdit" />
    <VentaSave :mostrar="mostrarDialog" :venta="itemEdit" :modoEdicion="!!itemEdit" @guardar="handleGuardar"
      @close="handleCloseDialog" />
  </div>
</template>
