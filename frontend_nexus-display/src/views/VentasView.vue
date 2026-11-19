<script setup lang="ts">
import VentaList from '@/components/venta/VentaList.vue'
import VentaSave from '@/components/venta/VentaSave.vue'
import FacturaDialog from '@/components/FacturaDialog.vue'
import type { Venta } from '@/models/venta'
import { useSesionStore } from '@/stores'
import Button from 'primevue/button'
import { ref } from 'vue'

const sesion = useSesionStore()
const mostrarDialog = ref(false)
const ventaListRef = ref<typeof VentaList | null>(null)
const facturaVisible = ref(false)
const ventaFactura = ref<Venta | null>(null)

function abrirFactura(venta: Venta) {
  ventaFactura.value = venta
  facturaVisible.value = true
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="page-header mb-3">
      <h2 class="page-title">
        {{ sesion.rol === 'CLIENTE' ? 'Mis Compras Realizadas' : 'Gestión de Ventas' }}
      </h2>
      <Button v-if="sesion.rol === 'ADMIN' || sesion.rol === 'VENDEDOR'" label="Registrar Venta"
        @click="mostrarDialog = true" />
    </div>
    <VentaList ref="ventaListRef" />
    <VentaSave :mostrar="mostrarDialog" @guardar="ventaListRef?.obtenerLista()" @factura="abrirFactura"
      @close="mostrarDialog = false" />
    <FacturaDialog v-model:visible="facturaVisible" :venta="ventaFactura" />
  </div>
</template>
