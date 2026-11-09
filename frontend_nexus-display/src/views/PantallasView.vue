<script setup lang="ts">
import PantallaList from '@/components/pantalla/PantallaList.vue'
import PantallaSave from '@/components/pantalla/PantallaSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref<boolean>(false)
const pantallaListRef = ref<typeof PantallaList | null>(null)
const pantallaEdit = ref<any>(null)

function handleCreate() {
  pantallaEdit.value = null
  mostrarDialog.value = true
}
function handleEdit(pantalla: any) {
  pantallaEdit.value = pantalla
  mostrarDialog.value = true
}
function handleCloseDialog() {
  mostrarDialog.value = false
}
function handleGuardar() {
  pantallaListRef.value?.obtenerLista()
}
</script>

<template>
  <div class="container py-5 mt-5">
    <h2>Catálogo de Pantallas</h2>
    <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    <PantallaList ref="pantallaListRef" @edit="handleEdit" />
    <PantallaSave :mostrar="mostrarDialog" :pantalla="pantallaEdit" :modoEdicion="!!pantallaEdit"
      @guardar="handleGuardar" @close="handleCloseDialog" />
  </div>
</template>
