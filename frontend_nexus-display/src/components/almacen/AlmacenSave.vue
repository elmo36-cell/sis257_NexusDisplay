<script setup lang="ts">
import type { Almacen } from '@/models/almacen'
import http from '@/plugins/axios'
import { Button, Dialog, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'almacenes'
const props = defineProps({
  mostrar: Boolean,
  almacen: {
    type: Object as () => Almacen,
    default: () => ({}) as Almacen,
  },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

const almacen = ref<Almacen>({ ...props.almacen })
watch(
  () => props.almacen,
  (newVal) => {
    almacen.value = { ...newVal }
  },
)

async function handleSave() {
  try {
    const body = {
      nombre: almacen.value.nombre,
      direccion: almacen.value.direccion,
      telefono: almacen.value.telefono,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${almacen.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    almacen.value = {} as Almacen
    dialogVisible.value = false
  } catch (error: any) {
    alert(error?.response?.data?.message || 'Error al guardar almacén')
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Almacén' : 'Crear Almacén'"
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
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </div>
  </Dialog>
</template>
