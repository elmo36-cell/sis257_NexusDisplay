<script setup lang="ts">
import ModeloList from '@/components/modelo/ModeloList.vue'
import ModeloSave from '@/components/modelo/ModeloSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref(false)
const modeloListRef = ref<typeof ModeloList | null>(null)
const modeloEdit = ref<any>(null)

function handleCreate() {
  modeloEdit.value = null
  mostrarDialog.value = true
}

function handleEdit(modelo: any) {
  modeloEdit.value = modelo
  mostrarDialog.value = true
}

function handleCloseDialog() {
  mostrarDialog.value = false
}

function handleGuardar() {
  modeloListRef.value?.obtenerLista()
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-content-between align-items-center mb-3">
      <h2 class="m-0">Modelos de Celulares</h2>
      <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    </div>
    <ModeloList ref="modeloListRef" @edit="handleEdit" />
    <ModeloSave :mostrar="mostrarDialog" :modelo="modeloEdit" :modoEdicion="!!modeloEdit" @guardar="handleGuardar"
      @close="handleCloseDialog" />
  </div>
</template>
