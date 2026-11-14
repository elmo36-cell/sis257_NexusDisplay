<script setup lang="ts">
import type { InventarioAlmacen } from '@/models/inventario-almacen'
import http from '@/plugins/axios'
import { useAuthStore } from '@/stores'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const authStore = useAuthStore()
const ENDPOINT = 'inventario-almacen'
const inventarios = ref<InventarioAlmacen[]>([])
const inventarioDelete = ref<InventarioAlmacen | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const emit = defineEmits(['edit'])

const inventariosFiltrados = computed(() => {
  return inventarios.value.filter(
    (inv) =>
      inv.pantalla?.nombre?.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      inv.pantalla?.codigo?.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      inv.almacen?.nombre?.toLowerCase().includes(busqueda.value.toLowerCase()),
  )
})

async function obtenerLista() {
  inventarios.value = await http.get(ENDPOINT).then((response) => response.data)
}

function emitirEdicion(inv: InventarioAlmacen) {
  emit('edit', inv)
}

function mostrarEliminarConfirm(inv: InventarioAlmacen) {
  inventarioDelete.value = inv
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${inventarioDelete.value?.id}`)
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
        <InputText v-model="busqueda" type="text" placeholder="Buscar por pantalla, SKU o almacén" />
      </InputGroup>
    </div>

    <table class="w-full border-collapse">
      <thead>
        <tr class="surface-200 text-left">
          <th class="p-2">Nro.</th>
          <th class="p-2">Foto</th>
          <th class="p-2">Almacén / Sucursal</th>
          <th class="p-2">Código SKU</th>
          <th class="p-2">Pantalla</th>
          <th class="p-2">Cantidad Disponible</th>
          <th v-if="authStore.isAdmin" class="p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(inv, index) in inventariosFiltrados" :key="inv.id" class="border-bottom-1 surface-border">
          <td class="p-2">{{ index + 1 }}</td>
          <td class="p-2">
            <img :src="inv.pantalla?.fotografia" height="40" class="border-round" />
          </td>
          <td class="p-2 font-semibold">{{ inv.almacen?.nombre }}</td>
          <td class="p-2">{{ inv.pantalla?.codigo }}</td>
          <td class="p-2">{{ inv.pantalla?.nombre }}</td>
          <td class="p-2 font-bold" :class="inv.cantidad <= 3 ? 'text-red-500' : 'text-green-600'">
            {{ inv.cantidad }} uds.
          </td>
          <td v-if="authStore.isAdmin" class="p-2">
            <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(inv)" />
            <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
              @click="mostrarEliminarConfirm(inv)" />
          </td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de eliminar este registro de inventario?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
