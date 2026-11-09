<script setup lang="ts">
import CalidadList from '@/components/calidad/CalidadList.vue'
import CalidadSave from '@/components/calidad/CalidadSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref<boolean>(false)
const calidadListRef = ref<typeof CalidadList | null>(null)
const calidadEdit = ref<any>(null)

function handleCreate() {
  calidadEdit.value = null
  mostrarDialog.value = true
}
function handleEdit(calidad: any) {
  calidadEdit.value = calidad
  mostrarDialog.value = true
}
function handleCloseDialog() {
  mostrarDialog.value = false
}
function handleGuardar() {
  calidadListRef.value?.obtenerLista()
}
</script>

<template>
  <div class="container py-5 mt-5">
    <h2>Calidades</h2>
    <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    <CalidadList ref="calidadListRef" @edit="handleEdit" />
    <CalidadSave :mostrar="mostrarDialog" :calidad="calidadEdit" :modoEdicion="!!calidadEdit" @guardar="handleGuardar"
      @close="handleCloseDialog" />
  </div>
</template>
