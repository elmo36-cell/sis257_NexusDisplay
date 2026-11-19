<script setup lang="ts">
import type { DetalleVenta } from '@/models/detalle-venta'
import DetalleVentaList from '@/components/detalleVenta/DetalleVentaList.vue'
import DetalleVentaSave from '@/components/detalleVenta/DetalleVentaSave.vue'
import clienteApi from '@/plugins/axios'
import { useSesionStore } from '@/stores'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button } from 'primevue'
import { onMounted, ref } from 'vue'

const RUTA_API = 'detalles-venta'
const sesion = useSesionStore()
const detalles = ref<DetalleVenta[]>([])
const editorVisible = ref(false)
const detalleSeleccionado = ref<DetalleVenta>({
  id: 0,
  idVenta: 0,
  idPantalla: 0,
  cantidad: 1,
  precioUnitario: 0,
  subtotal: 0,
})

async function obtenerLista() {
  try {
    const { data } = await clienteApi.get(RUTA_API)
    detalles.value = Array.isArray(data) ? data : []
  } catch (error) {
    notify.error(mensajeDeError(error, 'No se pudo cargar el detalle de ventas'))
  }
}

// El lápiz de cada fila abre el formulario de detalle en modo edición: así el
// DetalleVentaSave también se usa y no queda como código muerto.
function abrirEdicion(detalle: DetalleVenta) {
  detalleSeleccionado.value = detalle
  editorVisible.value = true
}

onMounted(obtenerLista)
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="m-0">Detalles de Ventas</h2>
        <p class="text-muted small m-0 mt-1">
          Desglose de pantallas vendidas, cantidades, precios unitarios y subtotales.
        </p>
      </div>
      <Button type="button" label="Actualizar Lista" severity="secondary" @click="obtenerLista" />
    </div>

    <DetalleVentaList :detalles="detalles" :editable="sesion.esAdmin" @editar="abrirEdicion" />

    <DetalleVentaSave :mostrar="editorVisible" :detalle-venta="detalleSeleccionado" modo-edicion
      @guardar="obtenerLista" @close="editorVisible = false" />
  </div>
</template>
