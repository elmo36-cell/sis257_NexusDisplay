<script setup lang="ts">
import type { Almacen } from '@/models/almacen'
import type { InventarioAlmacen } from '@/models/inventario-almacen'
import type { Pantalla } from '@/models/pantalla'
import http from '@/plugins/axios'
import { Button, Dialog, InputNumber, Select } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'inventario-almacen'
const props = defineProps({
  mostrar: Boolean,
  inventario: { type: Object as () => InventarioAlmacen, default: () => ({}) as InventarioAlmacen },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const almacenes = ref<Almacen[]>([])
const pantallas = ref<Pantalla[]>([])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

const inventario = ref<InventarioAlmacen>({ ...props.inventario })

async function cargarDatos() {
  almacenes.value = await http.get('almacenes').then((r) => r.data)
  pantallas.value = await http.get('pantallas').then((r) => r.data)
}

watch(
  () => props.mostrar,
  (nuevoValor) => {
    if (nuevoValor) {
      cargarDatos()
      if (props.inventario?.id) {
        inventario.value = {
          ...props.inventario,
          idAlmacen: props.inventario.idAlmacen || props.inventario.almacen?.id || 0,
          idPantalla: props.inventario.idPantalla || props.inventario.pantalla?.id || 0,
        }
      } else {
        inventario.value = { stock: 0 } as InventarioAlmacen
      }
    }
  },
)

async function handleSave() {
  try {
    const body = {
      idAlmacen: inventario.value.idAlmacen,
      idPantalla: inventario.value.idPantalla,
      stock: Number(inventario.value.stock),
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${inventario.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    inventario.value = {} as InventarioAlmacen
    dialogVisible.value = false
  } catch (error: any) {
    alert(error?.response?.data?.message || 'Error al guardar')
  }
}
</script>

<template>
  <div class="card flex justify-center">
    <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Inventario' : 'Registrar Inventario'"
      style="width: 28rem">
      <div class="flex items-center gap-4 mb-4">
        <label for="almacen" class="font-semibold w-3">Almacén</label>
        <Select id="almacen" v-model="inventario.idAlmacen" :options="almacenes" optionLabel="nombre" optionValue="id"
          class="flex-auto" autofocus />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="pantalla" class="font-semibold w-3">Pantalla</label>
        <Select id="pantalla" v-model="inventario.idPantalla" :options="pantallas" optionLabel="nombre" optionValue="id"
          class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="stock" class="font-semibold w-3">Stock</label>
        <InputNumber id="stock" v-model="inventario.stock" class="flex-auto" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </Dialog>
  </div>
</template>
