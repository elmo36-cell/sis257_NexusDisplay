<script setup lang="ts">
import type { Proveedor } from '@/models/proveedor'
import clienteApi from '@/plugins/axios'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

const RUTA_API = 'proveedores'
const props = defineProps({
  mostrar: Boolean,
  proveedor: {
    type: Object as () => Proveedor,
    default: () => ({}) as Proveedor,
  },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const dialogoVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

const proveedor = ref<Proveedor>({ ...props.proveedor })
watch(
  () => props.proveedor,
  (nuevoValor) => {
    proveedor.value = { ...nuevoValor }
  },
)

async function guardarCambios() {
  try {
    const cuerpo = {
      nombre: proveedor.value.nombre,
      nit: proveedor.value.nit,
      telefono: proveedor.value.telefono,
      direccion: proveedor.value.direccion,
    }
    if (props.modoEdicion) {
      await clienteApi.patch(`${RUTA_API}/${proveedor.value.id}`, cuerpo)
    } else {
      await clienteApi.post(RUTA_API, cuerpo)
    }
    emit('guardar')
    proveedor.value = {} as Proveedor
    dialogoVisible.value = false
    notify.success('Proveedor guardado correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'Error al guardar el proveedor'))
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogoVisible" :header="props.modoEdicion ? 'Editar Proveedor' : 'Crear Proveedor'"
    style="width: 25rem" modal>
    <div class="flex flex-column gap-3">
      <div>
        <label class="font-semibold block mb-1">Nombre / Empresa</label>
        <InputText v-model="proveedor.nombre" class="w-full" autofocus />
      </div>
      <div>
        <label class="font-semibold block mb-1">NIT</label>
        <InputText v-model="proveedor.nit" class="w-full" />
      </div>
      <div>
        <label class="font-semibold block mb-1">Teléfono</label>
        <InputText v-model="proveedor.telefono" class="w-full" />
      </div>
      <div>
        <label class="font-semibold block mb-1">Dirección</label>
        <InputText v-model="proveedor.direccion" class="w-full" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogoVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="guardarCambios" />
      </div>
    </div>
  </Dialog>
</template>
