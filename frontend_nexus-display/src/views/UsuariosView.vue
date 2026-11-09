<script setup lang="ts">
import UsuarioList from '@/components/usuario/UsuarioList.vue'
import UsuarioSave from '@/components/usuario/UsuarioSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref<boolean>(false)
const listRef = ref<typeof UsuarioList | null>(null)
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
    <h2>Usuarios</h2>
    <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    <UsuarioList ref="listRef" @edit="handleEdit" />
    <UsuarioSave :mostrar="mostrarDialog" :usuario="itemEdit" :modoEdicion="!!itemEdit" @guardar="handleGuardar"
      @close="handleCloseDialog" />
  </div>
</template>
