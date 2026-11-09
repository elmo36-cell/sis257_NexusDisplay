<script setup lang="ts">
import type { Compra } from '@/models/compra'
import type { DetalleCompra } from '@/models/detalle-compra'
import type { Pantalla } from '@/models/pantalla'
import http from '@/plugins/axios'
import { Button, Dialog, InputNumber, Select } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'detalles-compra'
const props = defineProps({
  mostrar: Boolean,
  detalle: { type: Object as () => DetalleCompra, default: () => ({}) as DetalleCompra },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const compras = ref<Compra[]>([])
const pantallas = ref<Pantalla[]>([])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

const detalle = ref<DetalleCompra>({ ...props.detalle })

async function cargarDatos() {
  compras.value = await http.get('compras').then((r) => r.data)
  pantallas.value = await http.get('pantallas').then((r) => r.data)
}

watch(
  () => props.mostrar,
  (nuevoValor) => {
    if (nuevoValor) {
      cargarDatos()
      if (props.detalle?.id) {
        detalle.value = { ...props.detalle }
      } else {
        detalle.value = { cantidad: 1, precioUnitario: 0, subtotal: 0 } as DetalleCompra
      }
    }
  },
)

async function handleSave() {
  try {
    const subtotal = Number(detalle.value.cantidad) * Number(detalle.value.precioUnitario)
    const body = {
      idCompra: detalle.value.idCompra,
      idPantalla: detalle.value.idPantalla,
      cantidad: Number(detalle.value.cantidad),
      precioUnitario: Number(detalle.value.precioUnitario),
      subtotal,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${detalle.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    dialogVisible.value = false
  } catch (error: any) {
    alert(error?.response?.data?.message || 'Error al guardar')
  }
}
</script>

<template>
  <div class="card flex justify-center">
    <Dialog v-model:visible="dialogVisible"
      :header="props.modoEdicion ? 'Editar Detalle Compra' : 'Agregar Detalle Compra'" style="width: 28rem">
      <div class="flex items-center gap-4 mb-4">
        <label for="compra" class="font-semibold w-3">ID Compra</label>
        <Select id="compra" v-model="detalle.idCompra" :options="compras" optionLabel="id" optionValue="id"
          class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="pantalla" class="font-semibold w-3">Pantalla</label>
        <Select id="pantalla" v-model="detalle.idPantalla" :options="pantallas" optionLabel="nombre" optionValue="id"
          class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="cantidad" class="font-semibold w-3">Cantidad</label>
        <InputNumber id="cantidad" v-model="detalle.cantidad" class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="precioUnitario" class="font-semibold w-3">P. Unitario</label>
        <InputNumber id="precioUnitario" v-model="detalle.precioUnitario" mode="decimal" :minFractionDigits="2"
          class="flex-auto" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </Dialog>
  </div>
</template>
