<script setup lang="ts">
import type { DetalleCompra } from '@/models/detalle-compra'
import type { Compra } from '@/models/compra'
import type { Pantalla } from '@/models/pantalla'
import http from '@/plugins/axios'
import { Button, Dialog, InputNumber, Select } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'detalles-compra'
const props = defineProps({
  mostrar: Boolean,
  detalleCompra: {
    type: Object as () => DetalleCompra,
    default: () => ({}) as DetalleCompra,
  },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const compras = ref<Compra[]>([])
const pantallas = ref<Pantalla[]>([])
const detalleCompra = ref<DetalleCompra>({ ...props.detalleCompra })

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

async function obtenerDatos() {
  const [resCompras, resPantallas] = await Promise.all([
    http.get('compras'),
    http.get('pantallas'),
  ])
  compras.value = resCompras.data
  pantallas.value = resPantallas.data
}

watch(
  () => props.mostrar,
  (newVal) => {
    if (newVal) {
      obtenerDatos()
      detalleCompra.value = { ...props.detalleCompra }
    }
  },
)

async function handleSave() {
  try {
    const body = {
      idCompra: detalleCompra.value.idCompra,
      idPantalla: detalleCompra.value.idPantalla,
      cantidad: Number(detalleCompra.value.cantidad),
      costoUnitario: Number(detalleCompra.value.costoUnitario),
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${detalleCompra.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    detalleCompra.value = {} as DetalleCompra
    dialogVisible.value = false
  } catch (error: any) {
    alert(error?.response?.data?.message || 'Error al guardar el detalle de compra')
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogVisible"
    :header="props.modoEdicion ? 'Editar Detalle de Compra' : 'Crear Detalle de Compra'" style="width: 25rem" modal>
    <div class="flex flex-column gap-3">
      <div>
        <label class="font-semibold block mb-1">Compra</label>
        <Select v-model="detalleCompra.idCompra" :options="compras" optionLabel="id" optionValue="id"
          placeholder="Seleccione ID de Compra" class="w-full" />
      </div>
      <div>
        <label class="font-semibold block mb-1">Pantalla</label>
        <Select v-model="detalleCompra.idPantalla" :options="pantallas" optionLabel="nombre" optionValue="id"
          placeholder="Seleccione una pantalla" class="w-full" />
      </div>
      <div>
        <label class="font-semibold block mb-1">Cantidad</label>
        <InputNumber v-model="detalleCompra.cantidad" :min="1" class="w-full" />
      </div>
      <div>
        <label class="font-semibold block mb-1">Costo Unitario (Bs.)</label>
        <InputNumber v-model="detalleCompra.costoUnitario" mode="decimal" :minFractionDigits="2" class="w-full" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </div>
  </Dialog>
</template>
