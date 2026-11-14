<script setup lang="ts">
import MarcaList from '@/components/marca/MarcaList.vue'
import MarcaSave from '@/components/marca/MarcaSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref(false)
const marcaListRef = ref<typeof MarcaList | null>(null)
const marcaEdit = ref<any>(null)

function handleCreate() {
  marcaEdit.value = null
  mostrarDialog.value = true
}

function handleEdit(marca: any) {
  marcaEdit.value = marca
  mostrarDialog.value = true
}

function handleCloseDialog() {
  mostrarDialog.value = false
}

function handleGuardar() {
  marcaListRef.value?.obtenerLista()
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-content-between align-items-center mb-3">
      <h2 class="m-0">Marcas de Dispositivos</h2>
      <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    </div>
    <MarcaList ref="marcaListRef" @edit="handleEdit" />
    <MarcaSave :mostrar="mostrarDialog" :marca="marcaEdit" :modoEdicion="!!marcaEdit" @guardar="handleGuardar"
      @close="handleCloseDialog" />
  </div>
</template>
