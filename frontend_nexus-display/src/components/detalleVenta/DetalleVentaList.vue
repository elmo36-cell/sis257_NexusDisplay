<script setup lang="ts">
import type { DetalleVenta } from '@/models/detalle-venta'
import http from '@/plugins/axios'
import { Button, Dialog } from 'primevue'
import { onMounted, ref } from 'vue'

const ENDPOINT = 'detalles-venta'
const detalles = ref<DetalleVenta[]>([])
const detalleDelete = ref<DetalleVenta | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const emit = defineEmits(['edit'])

async function obtenerLista() {
  detalles.value = await http.get(ENDPOINT).then((response) => response.data)
}

function emitirEdicion(detalle: DetalleVenta) {
  emit('edit', detalle)
}

function mostrarEliminarConfirm(detalle: DetalleVenta) {
  detalleDelete.value = detalle
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${detalleDelete.value?.id}`)
  obtenerLista()
  mostrarConfirmDialog.value = false
}

onMounted(() => {
  obtenerLista()
})
defineExpose({ obtenerLista })
</script>

<template>
  <div>
    <table class="table table-bordered table-striped mt-3">
      <thead>
        <tr>
          <th>Nro.</th>
          <th>ID Venta</th>
          <th>Pantalla</th>
          <th>Cantidad</th>
          <th>P. Unitario</th>
          <th>Subtotal</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(d, index) in detalles" :key="d.id">
          <td>{{ index + 1 }}</td>
          <td>#{{ d.idVenta || d.venta?.id }}</td>
          <td>{{ d.pantalla?.nombre }}</td>
          <td>{{ d.cantidad }}</td>
          <td>{{ d.precioUnitario }}</td>
          <td>{{ d.subtotal }}</td>
          <td>
            <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(d)" />
            <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
              @click="mostrarEliminarConfirm(d)" />
          </td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de eliminar este detalle de venta?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
