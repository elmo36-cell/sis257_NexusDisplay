<script setup lang="ts">
import type { InventarioAlmacen } from '@/models/inventario-almacen'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'inventario-almacen'
const inventarios = ref<InventarioAlmacen[]>([])
const inventarioDelete = ref<InventarioAlmacen | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const emit = defineEmits(['edit'])

const inventariosFiltrados = computed(() => {
  return inventarios.value.filter(
    (i) =>
      i.pantalla?.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      i.almacen?.nombre.toLowerCase().includes(busqueda.value.toLowerCase()),
  )
})

async function obtenerLista() {
  inventarios.value = await http.get(ENDPOINT).then((response) => response.data)
}

function emitirEdicion(inventario: InventarioAlmacen) {
  emit('edit', inventario)
}

function mostrarEliminarConfirm(inventario: InventarioAlmacen) {
  inventarioDelete.value = inventario
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
        <InputText v-model="busqueda" type="text" placeholder="Buscar por pantalla o almacén" />
      </InputGroup>
    </div>

    <table class="table table-bordered table-striped">
      <thead>
        <tr>
          <th>Nro.</th>
          <th>Almacén</th>
          <th>Pantalla</th>
          <th>Stock Disponible</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in inventariosFiltrados" :key="item.id">
          <td>{{ index + 1 }}</td>
          <td>{{ item.almacen?.nombre }}</td>
          <td>{{ item.pantalla?.nombre }}</td>
          <td>{{ item.stock }}</td>
          <td>
            <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(item)" />
            <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
              @click="mostrarEliminarConfirm(item)" />
          </td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de que deseas eliminar este registro de inventario?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
