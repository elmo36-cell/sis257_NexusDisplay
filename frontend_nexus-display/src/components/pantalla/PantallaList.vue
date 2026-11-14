<script setup lang="ts">
import type { Pantalla } from '@/models/pantalla'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'pantallas'
const pantallas = ref<Pantalla[]>([])
const pantallaDelete = ref<Pantalla | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const emit = defineEmits(['edit'])

const pantallasFiltradas = computed(() => {
  return pantallas.value.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      (p.modelo?.nombre ?? '').toLowerCase().includes(busqueda.value.toLowerCase()) ||
      (p.modelo?.marca?.nombre ?? '').toLowerCase().includes(busqueda.value.toLowerCase()),
  )
})

function obtenerStockTotal(p: Pantalla): number {
  return p.inventarios?.reduce((acc, inv) => acc + inv.cantidad, 0) || 0
}

async function obtenerLista() {
  pantallas.value = await http.get(ENDPOINT).then((response) => response.data)
}

function emitirEdicion(pantalla: Pantalla) {
  emit('edit', pantalla)
}

function mostrarEliminarConfirm(pantalla: Pantalla) {
  pantallaDelete.value = pantalla
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${pantallaDelete.value?.id}`)
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
        <InputText v-model="busqueda" type="text" placeholder="Buscar por nombre, código SKU, marca o modelo" />
      </InputGroup>
    </div>

    <table class="w-full border-collapse">
      <thead>
        <tr class="surface-200 text-left">
          <th class="p-2">Nro.</th>
          <th class="p-2">Fotografía</th>
          <th class="p-2">Código SKU</th>
          <th class="p-2">Nombre</th>
          <th class="p-2">Marca / Modelo</th>
          <th class="p-2">Calidad</th>
          <th class="p-2">Categoría</th>
          <th class="p-2">Color / Marco</th>
          <th class="p-2">Precio Venta</th>
          <th class="p-2">Stock Total</th>
          <th class="p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(pantalla, index) in pantallasFiltradas" :key="pantalla.id" class="border-bottom-1 surface-border">
          <td class="p-2">{{ index + 1 }}</td>
          <td class="p-2">
            <img :src="pantalla.fotografia" :alt="pantalla.nombre" height="45" class="border-round" />
          </td>
          <td class="p-2 font-semibold">{{ pantalla.codigo }}</td>
          <td class="p-2">{{ pantalla.nombre }}</td>
          <td class="p-2">{{ pantalla.modelo?.marca?.nombre }} - {{ pantalla.modelo?.nombre }}</td>
          <td class="p-2">{{ pantalla.calidad?.nombre }}</td>
          <td class="p-2">{{ pantalla.categoria?.nombre }}</td>
          <td class="p-2">{{ pantalla.color }} ({{ pantalla.conMarco ? 'Con Marco' : 'Sin Marco' }})</td>
          <td class="p-2 font-bold">Bs. {{ pantalla.precioVenta }}</td>
          <td class="p-2 font-bold">{{ obtenerStockTotal(pantalla) }} uds.</td>
          <td class="p-2">
            <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(pantalla)" />
            <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
              @click="mostrarEliminarConfirm(pantalla)" />
          </td>
        </tr>
        <tr v-if="pantallasFiltradas.length === 0">
          <td colspan="11" class="p-3 text-center">No se encontraron resultados.</td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de eliminar la pantalla <strong>{{ pantallaDelete?.nombre }}</strong>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
