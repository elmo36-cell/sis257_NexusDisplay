<script setup lang="ts">
import CompraList from '@/components/compra/CompraList.vue'
import CompraSave from '@/components/compra/CompraSave.vue'
import Button from 'primevue/button'
import { ref } from 'vue'

const mostrarDialog = ref(false)
const compraListRef = ref<typeof CompraList | null>(null)
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="page-header mb-3">
      <h2 class="page-title">Compras a Proveedores</h2>
      <Button type="button" label="Registrar Compra" @click="mostrarDialog = true" />
    </div>
    <CompraList ref="compraListRef" />
    <CompraSave :mostrar="mostrarDialog" @guardar="compraListRef?.obtenerLista()" @close="mostrarDialog = false" />
  </div>
</template>
