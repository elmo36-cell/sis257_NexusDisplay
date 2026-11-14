<script setup lang="ts">
import CategoriaList from '@/components/categoria/CategoriaList.vue'
import CategoriaSave from '@/components/categoria/CategoriaSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref(false)
const categoriaListRef = ref<typeof CategoriaList | null>(null)
const categoriaEdit = ref<any>(null)

function handleCreate() {
  categoriaEdit.value = null
  mostrarDialog.value = true
}

function handleEdit(categoria: any) {
  categoriaEdit.value = categoria
  mostrarDialog.value = true
}

function handleCloseDialog() {
  mostrarDialog.value = false
}

function handleGuardar() {
  categoriaListRef.value?.obtenerLista()
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-content-between align-items-center mb-3">
      <h2 class="m-0">Categorías de Repuestos</h2>
      <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    </div>
    <CategoriaList ref="categoriaListRef" @edit="handleEdit" />
    <CategoriaSave :mostrar="mostrarDialog" :categoria="categoriaEdit" :modoEdicion="!!categoriaEdit"
      @guardar="handleGuardar" @close="handleCloseDialog" />
  </div>
</template>
