<script setup lang="ts">
import type { InventarioAlmacen } from '@/models/inventario-almacen'
import type { Pantalla } from '@/models/pantalla'
import type { Almacen } from '@/models/almacen'
import http from '@/plugins/axios'
import { Button, Dialog, InputNumber, Select } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'inventario-almacen'
const props = defineProps({
  mostrar: Boolean,
  inventario: {
    type: Object as () => InventarioAlmacen,
    default: () => ({}) as InventarioAlmacen,
  },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const pantallas = ref<Pantalla[]>([])
const almacenes = ref<Almacen[]>([])
const inventario = ref<InventarioAlmacen>({ ...props.inventario })

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

async function cargarListas() {
  const [resPantallas, resAlmacenes] = await Promise.all([
    http.get('pantallas'),
    http.get('almacenes'),
  ])
  pantallas.value = resPantallas.data
  almacenes.value = resAlmacenes.data
}

watch(
  () => props.mostrar,
  (newVal) => {
    if (newVal) {
      cargarListas()
      inventario.value = { ...props.inventario, cantidad: props.inventario.cantidad ?? 0 }
    }
  },
)

async function handleSave() {
  try {
    const body = {
      idPantalla: inventario.value.idPantalla,
      idAlmacen: inventario.value.idAlmacen,
      cantidad: Number(inventario.value.cantidad),
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
    alert(error?.response?.data?.message || 'Error al guardar inventario')
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogVisible"
    :header="props.modoEdicion ? 'Ajustar Stock en Almacén' : 'Asignar Stock a Almacén'" style="width: 26rem" modal>
    <div class="flex flex-column gap-3">
      <div>
        <label class="font-semibold block mb-1">Almacén</label>
        <Select v-model="inventario.idAlmacen" :options="almacenes" optionLabel="nombre" optionValue="id"
          placeholder="Seleccione un almacén" class="w-full" />
      </div>
      <div>
        <label class="font-semibold block mb-1">Pantalla</label>
        <Select v-model="inventario.idPantalla" :options="pantallas" optionLabel="nombre" optionValue="id"
          placeholder="Seleccione una pantalla" class="w-full" />
      </div>
      <div>
        <label class="font-semibold block mb-1">Cantidad en Stock</label>
        <InputNumber v-model="inventario.cantidad" :min="0" class="w-full" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </div>
  </Dialog>
</template>
