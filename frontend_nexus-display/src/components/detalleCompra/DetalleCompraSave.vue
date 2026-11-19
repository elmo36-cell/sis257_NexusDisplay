<script setup lang="ts">
import type { DetalleCompra } from '@/models/detalle-compra'
import type { Compra } from '@/models/compra'
import type { Pantalla } from '@/models/pantalla'
import clienteApi from '@/plugins/axios'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputNumber, Select } from 'primevue'
import { computed, ref, watch } from 'vue'

const RUTA_API = 'detalles-compra'
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

const dialogoVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

async function obtenerDatos() {
  const [resCompras, resPantallas] = await Promise.all([
    clienteApi.get('compras'),
    clienteApi.get('pantallas'),
  ])
  compras.value = resCompras.data
  pantallas.value = resPantallas.data
}

watch(
  () => props.mostrar,
  (nuevoValor) => {
    if (nuevoValor) {
      obtenerDatos()
      detalleCompra.value = { ...props.detalleCompra }
    }
  },
)

async function guardarCambios() {
  try {
    const cuerpo = {
      idCompra: detalleCompra.value.idCompra,
      idPantalla: detalleCompra.value.idPantalla,
      cantidad: Number(detalleCompra.value.cantidad),
      costoUnitario: Number(detalleCompra.value.costoUnitario),
    }
    if (props.modoEdicion) {
      await clienteApi.patch(`${RUTA_API}/${detalleCompra.value.id}`, cuerpo)
    } else {
      await clienteApi.post(RUTA_API, cuerpo)
    }
    emit('guardar')
    detalleCompra.value = {} as DetalleCompra
    dialogoVisible.value = false
    notify.success('Detalle de compra guardado correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'Error al guardar el detalle de compra'))
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogoVisible"
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
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogoVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="guardarCambios" />
      </div>
    </div>
  </Dialog>
</template>
