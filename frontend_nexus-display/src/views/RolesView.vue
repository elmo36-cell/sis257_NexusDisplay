<script setup lang="ts">
import RolList from '@/components/rol/RolList.vue'
import RolSave from '@/components/rol/RolSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref<boolean>(false)
const listRef = ref<typeof RolList | null>(null)
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
    <h2>Roles</h2>
    <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    <RolList ref="listRef" @edit="handleEdit" />
    <RolSave :mostrar="mostrarDialog" :rol="itemEdit" :modoEdicion="!!itemEdit" @guardar="handleGuardar"
      @close="handleCloseDialog" />
  </div>
</template>
