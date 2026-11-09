<script setup lang="ts">
import type { Compra } from '@/models/compra'
import http from '@/plugins/axios'
import { Button, Dialog } from 'primevue'
import { onMounted, ref } from 'vue'

const ENDPOINT = 'compras'
const compras = ref<Compra[]>([])
const compraDelete = ref<Compra | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const emit = defineEmits(['edit'])

async function obtenerLista() {
  compras.value = await http.get(ENDPOINT).then((response) => response.data)
}

function emitirEdicion(compra: Compra) {
  emit('edit', compra)
}

function mostrarEliminarConfirm(compra: Compra) {
  compraDelete.value = compra
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${compraDelete.value?.id}`)
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
          <th>Fecha</th>
          <th>Proveedor</th>
          <th>Usuario</th>
          <th>Total (Bs)</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(compra, index) in compras" :key="compra.id">
          <td>{{ index + 1 }}</td>
          <td>{{ compra.fecha }}</td>
          <td>{{ compra.proveedor?.nombre }}</td>
          <td>{{ compra.usuario?.usuario }}</td>
          <td>{{ compra.total }}</td>
          <td>
            <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(compra)" />
            <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
              @click="mostrarEliminarConfirm(compra)" />
          </td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de que deseas eliminar la compra #<b>{{ compraDelete?.id }}</b>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
