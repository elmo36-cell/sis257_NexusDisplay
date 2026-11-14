<script setup lang="ts">
import type { Compra } from '@/models/compra'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'compras'
const compras = ref<Compra[]>([])
const compraDelete = ref<Compra | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')

const comprasFiltradas = computed(() => {
  return compras.value.filter(
    (c) =>
      c.proveedor?.nombre?.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      c.almacen?.nombre?.toLowerCase().includes(busqueda.value.toLowerCase()),
  )
})

async function obtenerLista() {
  compras.value = await http.get(ENDPOINT).then((response) => response.data)
}

function mostrarEliminarConfirm(compra: Compra) {
  compraDelete.value = compra
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  try {
    await http.delete(`${ENDPOINT}/${compraDelete.value?.id}`)
    obtenerLista()
    mostrarConfirmDialog.value = false
  } catch (error: any) {
    alert(error?.response?.data?.message || 'No se puede eliminar la compra')
  }
}

onMounted(() => {
  obtenerLista()
})
defineExpose({ obtenerLista })
</script>

<template>
  <div>
    <div class="col-7 pl-0 mt-3 mb-3">
      <InputGroup>
        <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
        <InputText v-model="busqueda" type="text" placeholder="Buscar por proveedor o almacén" />
      </InputGroup>
    </div>

    <table class="w-full border-collapse">
      <thead>
        <tr class="surface-200 text-left">
          <th class="p-2">ID</th>
          <th class="p-2">Fecha</th>
          <th class="p-2">Proveedor</th>
          <th class="p-2">Almacén Destino</th>
          <th class="p-2">Registrado por</th>
          <th class="p-2">Ítems Comprados</th>
          <th class="p-2">Total</th>
          <th class="p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in comprasFiltradas" :key="c.id" class="border-bottom-1 surface-border">
          <td class="p-2">#{{ c.id }}</td>
          <td class="p-2">{{ new Date(c.fecha).toLocaleString() }}</td>
          <td class="p-2 font-semibold">{{ c.proveedor?.nombre }}</td>
          <td class="p-2">{{ c.almacen?.nombre }}</td>
          <td class="p-2">{{ c.usuario?.nombreUsuario }}</td>
          <td class="p-2 text-sm">
            <div v-for="d in c.detalles" :key="d.id">
              +{{ d.cantidad }}x {{ d.pantalla?.nombre }} (Bs. {{ d.costoUnitario }})
            </div>
          </td>
          <td class="p-2 font-bold">Bs. {{ c.total }}</td>
          <td class="p-2">
            <Button icon="pi pi-trash" severity="danger" text @click="mostrarEliminarConfirm(c)" />
          </td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Anular Compra" :style="{ width: '25rem' }">
      <p>¿Deseas anular la compra <strong>#{{ compraDelete?.id }}</strong> y descontar el stock ingresado?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Anular Compra" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
