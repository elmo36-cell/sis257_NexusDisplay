<script setup lang="ts">
import AlmacenList from '@/components/almacen/AlmacenList.vue'
import AlmacenSave from '@/components/almacen/AlmacenSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref<boolean>(false)
const almacenListRef = ref<typeof AlmacenList | null>(null)
const almacenEdit = ref<any>(null)

function handleCreate() {
  almacenEdit.value = null
  mostrarDialog.value = true
}
function handleEdit(almacen: any) {
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
  <div class="container py-5 mt-5">
    <h2>Almacenes</h2>
    <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    <AlmacenList ref="almacenListRef" @edit="handleEdit" />
    <AlmacenSave :mostrar="mostrarDialog" :almacen="almacenEdit" :modoEdicion="!!almacenEdit" @guardar="handleGuardar"
      @close="handleCloseDialog" />
  </div>
</template>
