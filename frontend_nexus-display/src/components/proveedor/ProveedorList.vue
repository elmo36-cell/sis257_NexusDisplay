<script setup lang="ts">
import type { Proveedor } from '@/models/proveedor'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'proveedores'
const proveedores = ref<Proveedor[]>([])
const proveedorDelete = ref<Proveedor | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const emit = defineEmits(['edit'])

const proveedoresFiltrados = computed(() => {
  return proveedores.value.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      p.nit.toLowerCase().includes(busqueda.value.toLowerCase()),
  )
})

async function obtenerLista() {
  proveedores.value = await http.get(ENDPOINT).then((response) => response.data)
}

function emitirEdicion(proveedor: Proveedor) {
  emit('edit', proveedor)
}

function mostrarEliminarConfirm(proveedor: Proveedor) {
  proveedorDelete.value = proveedor
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${proveedorDelete.value?.id}`)
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
        <InputText v-model="busqueda" type="text" placeholder="Buscar proveedor por nombre o NIT" />
      </InputGroup>
    </div>

    <table class="w-full border-collapse">
      <thead>
        <tr class="surface-200 text-left">
          <th class="p-2">Nro.</th>
          <th class="p-2">Nombre / Empresa</th>
          <th class="p-2">NIT</th>
          <th class="p-2">Teléfono</th>
          <th class="p-2">Dirección</th>
          <th class="p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(proveedor, index) in proveedoresFiltrados" :key="proveedor.id"
          class="border-bottom-1 surface-border">
          <td class="p-2">{{ index + 1 }}</td>
          <td class="p-2 font-semibold">{{ proveedor.nombre }}</td>
          <td class="p-2">{{ proveedor.nit }}</td>
          <td class="p-2">{{ proveedor.telefono }}</td>
          <td class="p-2">{{ proveedor.direccion }}</td>
          <td class="p-2">
            <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(proveedor)" />
            <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
              @click="mostrarEliminarConfirm(proveedor)" />
          </td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de eliminar al proveedor <strong>{{ proveedorDelete?.nombre }}</strong>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
