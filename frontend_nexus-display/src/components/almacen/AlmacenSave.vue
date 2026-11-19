<script setup lang="ts">
import type { Almacen } from '@/models/almacen'
import clienteApi from '@/plugins/axios'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

const RUTA_API = 'almacenes'
const props = defineProps({
  mostrar: Boolean,
  almacen: {
    type: Object as () => Almacen,
    default: () => ({}) as Almacen,
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

const almacen = ref<Almacen>({ ...props.almacen })
watch(
  () => props.almacen,
  (nuevoValor) => {
    almacen.value = { ...nuevoValor }
  },
)

async function guardarCambios() {
  try {
    const cuerpo = {
      nombre: almacen.value.nombre,
      direccion: almacen.value.direccion,
      telefono: almacen.value.telefono,
    }
    if (props.modoEdicion) {
      await clienteApi.patch(`${RUTA_API}/${almacen.value.id}`, cuerpo)
    } else {
      await clienteApi.post(RUTA_API, cuerpo)
    }
    emit('guardar')
    almacen.value = {} as Almacen
    dialogoVisible.value = false
    notify.success('Almacén guardado correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'Error al guardar el almacén'))
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogoVisible" :header="props.modoEdicion ? 'Editar Almacén' : 'Crear Almacén'"
    style="width: 25rem" modal>
    <div class="flex flex-column gap-3">
      <div>
        <label class="font-semibold block mb-1">Nombre</label>
        <InputText v-model="almacen.nombre" class="w-full" autofocus />
      </div>
      <div>
        <label class="font-semibold block mb-1">Dirección</label>
        <InputText v-model="almacen.direccion" class="w-full" />
      </div>
      <div>
        <label class="font-semibold block mb-1">Teléfono</label>
        <InputText v-model="almacen.telefono" class="w-full" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogoVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="guardarCambios" />
      </div>
    </div>
  </Dialog>
</template>
