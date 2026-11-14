<script setup lang="ts">
import PantallaList from '@/components/pantalla/PantallaList.vue'
import PantallaSave from '@/components/pantalla/PantallaSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref(false)
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
  <div class="container mx-auto p-4">
    <div class="flex justify-content-between align-items-center mb-3">
      <h2 class="m-0">Pantallas</h2>
      <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    </div>
    <PantallaList ref="pantallaListRef" @edit="handleEdit" />
    <PantallaSave :mostrar="mostrarDialog" :pantalla="pantallaEdit" :modoEdicion="!!pantallaEdit"
      @guardar="handleGuardar" @close="handleCloseDialog" />
  </div>
</template>
