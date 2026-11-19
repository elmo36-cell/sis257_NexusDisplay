<script setup lang="ts">
import type { DetalleVenta } from '@/models/detalle-venta'
import type { Venta } from '@/models/venta'
import type { Pantalla } from '@/models/pantalla'
import clienteApi from '@/plugins/axios'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputNumber, Select } from 'primevue'
import { computed, ref, watch } from 'vue'

const RUTA_API = 'detalles-venta'
const props = defineProps({
  mostrar: Boolean,
  detalleVenta: {
    type: Object as () => DetalleVenta,
    default: () => ({}) as DetalleVenta,
  },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const ventas = ref<Venta[]>([])
const pantallas = ref<Pantalla[]>([])
const detalleVenta = ref<DetalleVenta>({ ...props.detalleVenta })

const dialogoVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

async function obtenerDatos() {
  const [resVentas, resPantallas] = await Promise.all([
    clienteApi.get('ventas'),
    clienteApi.get('pantallas'),
  ])
  ventas.value = resVentas.data
  pantallas.value = resPantallas.data
}

watch(
  () => props.mostrar,
  (nuevoValor) => {
    if (nuevoValor) {
      obtenerDatos()
      detalleVenta.value = { ...props.detalleVenta }
    }
  },
)

async function guardarCambios() {
  try {
    const cuerpo = {
      idVenta: detalleVenta.value.idVenta,
      idPantalla: detalleVenta.value.idPantalla,
      cantidad: Number(detalleVenta.value.cantidad),
      precioUnitario: Number(detalleVenta.value.precioUnitario),
    }
    if (props.modoEdicion) {
      await clienteApi.patch(`${RUTA_API}/${detalleVenta.value.id}`, cuerpo)
    } else {
      await clienteApi.post(RUTA_API, cuerpo)
    }
    emit('guardar')
    detalleVenta.value = {} as DetalleVenta
    dialogoVisible.value = false
    notify.success('Detalle de venta guardado correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'Error al guardar el detalle de venta'))
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogoVisible"
    :header="props.modoEdicion ? 'Editar Detalle de Venta' : 'Crear Detalle de Venta'" style="width: 25rem" modal>
    <div class="flex flex-column gap-3">
      <div>
        <label class="font-semibold block mb-1">Venta</label>
        <Select v-model="detalleVenta.idVenta" :options="ventas" optionLabel="id" optionValue="id"
          placeholder="Seleccione ID de Venta" class="w-full" />
      </div>
      <div>
        <label class="font-semibold block mb-1">Pantalla</label>
        <Select v-model="detalleVenta.idPantalla" :options="pantallas" optionLabel="nombre" optionValue="id"
          placeholder="Seleccione una pantalla" class="w-full" />
      </div>
      <div>
        <label class="font-semibold block mb-1">Cantidad</label>
        <InputNumber v-model="detalleVenta.cantidad" :min="1" class="w-full" />
      </div>
      <div>
        <label class="font-semibold block mb-1">Precio Unitario (Bs.)</label>
        <InputNumber v-model="detalleVenta.precioUnitario" mode="decimal" :minFractionDigits="2" class="w-full" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogoVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="guardarCambios" />
      </div>
    </div>
  </Dialog>
</template>
