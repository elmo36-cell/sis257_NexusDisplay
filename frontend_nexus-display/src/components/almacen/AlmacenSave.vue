<script setup lang="ts">
import type { Almacen } from '@/models/almacen'
import http from '@/plugins/axios'
import { Button, Dialog, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'almacenes'
const props = defineProps({
  mostrar: Boolean,
  almacen: { type: Object as () => Almacen, default: () => ({}) as Almacen },
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
      ubicacion: almacen.value.ubicacion,
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
    alert(error?.response?.data?.message || 'Error al guardar')
  }
}
</script>

<template>
  <div class="card flex justify-center">
    <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Almacén' : 'Crear Almacén'"
      style="width: 25rem">
      <div class="flex items-center gap-4 mb-4">
        <label for="nombre" class="font-semibold w-3">Nombre</label>
        <InputText id="nombre" v-model="almacen.nombre" class="flex-auto" autocomplete="off" autofocus />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="ubicacion" class="font-semibold w-3">Ubicación</label>
        <InputText id="ubicacion" v-model="almacen.ubicacion" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </Dialog>
  </div>
</template>
