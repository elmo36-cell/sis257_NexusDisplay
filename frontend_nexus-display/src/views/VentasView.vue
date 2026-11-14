<script setup lang="ts">
import VentaList from '@/components/venta/VentaList.vue'
import VentaSave from '@/components/venta/VentaSave.vue'
import { useAuthStore } from '@/stores'
import Button from 'primevue/button'
import { ref } from 'vue'

const authStore = useAuthStore()
const mostrarDialog = ref(false)
const ventaListRef = ref<typeof VentaList | null>(null)
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="m-0">
        {{ authStore.rol === 'CLIENTE' ? 'Mis Compras Realizadas' : 'Gestión de Ventas' }}
      </h2>
      <Button v-if="authStore.rol === 'ADMIN' || authStore.rol === 'VENDEDOR'" label="Registrar Venta"
        @click="mostrarDialog = true" />
    </div>
    <VentaList ref="ventaListRef" />
    <VentaSave :mostrar="mostrarDialog" @guardar="ventaListRef?.obtenerLista()" @close="mostrarDialog = false" />
  </div>
</template>
