<script setup lang="ts">
import type { Venta } from '@/models/venta'
import http from '@/plugins/axios'
import { useAuthStore } from '@/stores'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const authStore = useAuthStore()
const ENDPOINT = 'ventas'
const ventas = ref<Venta[]>([])
const ventaDelete = ref<Venta | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')

const ventasVisiblesSegunRol = computed(() => {
  const base =
    authStore.rol === 'CLIENTE'
      ? ventas.value.filter((v) => v.idUsuario === authStore.userId)
      : ventas.value

  return base.filter(
    (v) =>
      v.nombreCliente?.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      v.documentoCliente?.toLowerCase().includes(busqueda.value.toLowerCase()),
  )
})

async function obtenerLista() {
  ventas.value = await http.get(ENDPOINT).then((response) => response.data)
}

function mostrarEliminarConfirm(venta: Venta) {
  ventaDelete.value = venta
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${ventaDelete.value?.id}`)
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
    <div class="col-7 pl-0 mt-3 mb-3">
      <InputGroup>
        <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
        <InputText v-model="busqueda" type="text" placeholder="Buscar por cliente o NIT/CI" />
      </InputGroup>
    </div>

    <table class="w-full border-collapse">
      <thead>
        <tr class="surface-200 text-left">
          <th class="p-2">ID</th>
          <th class="p-2">Fecha</th>
          <th class="p-2">Cliente</th>
          <th class="p-2">NIT / CI</th>
          <th class="p-2">Almacén</th>
          <th class="p-2">Atendido por</th>
          <th class="p-2">Pantallas Vendidas</th>
          <th class="p-2">Total</th>
          <th v-if="authStore.isAdmin" class="p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="v in ventasVisiblesSegunRol" :key="v.id" class="border-bottom-1 surface-border">
          <td class="p-2">#{{ v.id }}</td>
          <td class="p-2">{{ new Date(v.fecha).toLocaleString() }}</td>
          <td class="p-2 font-semibold">{{ v.nombreCliente }}</td>
          <td class="p-2">{{ v.documentoCliente }}</td>
          <td class="p-2">{{ v.almacen?.nombre }}</td>
          <td class="p-2">{{ v.usuario?.nombreUsuario }}</td>
          <td class="p-2 text-sm">
            <div v-for="d in v.detalles" :key="d.id">
              {{ d.cantidad }}x {{ d.pantalla?.nombre }} (Bs. {{ d.precioUnitario }})
            </div>
          </td>
          <td class="p-2 font-bold">Bs. {{ v.total }}</td>
          <td v-if="authStore.isAdmin" class="p-2">
            <Button icon="pi pi-trash" severity="danger" text @click="mostrarEliminarConfirm(v)" />
          </td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Anular Venta" :style="{ width: '25rem' }">
      <p>¿Estás seguro de anular la venta <strong>#{{ ventaDelete?.id }}</strong> y devolver las pantallas al almacén?
      </p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Anular Venta" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
