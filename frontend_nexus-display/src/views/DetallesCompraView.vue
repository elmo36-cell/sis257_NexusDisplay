<script setup lang="ts">
import type { DetalleCompra } from '@/models/detalle-compra'
import DetalleCompraList from '@/components/detalleCompra/DetalleCompraList.vue'
import DetalleCompraSave from '@/components/detalleCompra/DetalleCompraSave.vue'
import clienteApi from '@/plugins/axios'
import { useSesionStore } from '@/stores'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button } from 'primevue'
import { onMounted, ref } from 'vue'

const RUTA_API = 'detalles-compra'
const sesion = useSesionStore()
const detalles = ref<DetalleCompra[]>([])
const editorVisible = ref(false)
const detalleSeleccionado = ref<DetalleCompra>({
  id: 0,
  idCompra: 0,
  idPantalla: 0,
  cantidad: 1,
  costoUnitario: 0,
  subtotal: 0,
})

async function obtenerLista() {
  try {
    const { data } = await clienteApi.get(RUTA_API)
    detalles.value = Array.isArray(data) ? data : []
  } catch (error) {
    notify.error(mensajeDeError(error, 'No se pudo cargar el detalle de compras'))
  }
}

// El lápiz abre el formulario de detalle en modo edición, para reutilizar el
// DetalleCompraSave que antes no se usaba en ninguna pantalla.
function abrirEdicion(detalle: DetalleCompra) {
  detalleSeleccionado.value = detalle
  editorVisible.value = true
}

onMounted(obtenerLista)
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="m-0">Detalles de Compras</h2>
        <p class="text-muted small m-0 mt-1">
          Desglose de pantallas adquiridas a proveedores, cantidades ingresadas y costos unitarios.
        </p>
      </div>
      <Button type="button" label="Actualizar Lista" severity="secondary" @click="obtenerLista" />
    </div>

    <DetalleCompraList :detalles="detalles" :editable="sesion.esAdmin" @editar="abrirEdicion" />

    <DetalleCompraSave :mostrar="editorVisible" :detalle-compra="detalleSeleccionado" modo-edicion
      @guardar="obtenerLista" @close="editorVisible = false" />
  </div>
</template>
