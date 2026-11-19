<script setup lang="ts">
import ProveedorList from '@/components/proveedor/ProveedorList.vue'
import ProveedorSave from '@/components/proveedor/ProveedorSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref(false)
const proveedorListRef = ref<typeof ProveedorList | null>(null)
const proveedorEdit = ref<any>(null)

function handleCreate() {
  proveedorEdit.value = null
  mostrarDialog.value = true
}

function handleEdit(proveedor: any) {
  proveedorEdit.value = proveedor
  mostrarDialog.value = true
}

function handleCloseDialog() {
  mostrarDialog.value = false
}

function handleGuardar() {
  proveedorListRef.value?.obtenerLista()
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-content-between align-articulos-center mb-3">
      <h2 class="m-0">Proveedores</h2>
      <Button label="Crear Nuevo" icon="pi pi-plus" @click="handleCreate" />
    </div>
    <ProveedorList ref="proveedorListRef" @edit="handleEdit" />
    <ProveedorSave :mostrar="mostrarDialog" :proveedor="proveedorEdit" :modoEdicion="!!proveedorEdit"
      @guardar="handleGuardar" @close="handleCloseDialog" />
  </div>
</template>
