<script setup lang="ts">
import type { Calidad } from '@/models/calidad'
import http from '@/plugins/axios'
import { Button, Dialog, InputText, Textarea } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'calidades'
const props = defineProps({
  mostrar: Boolean,
  calidad: { type: Object as () => Calidad, default: () => ({}) as Calidad },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

const calidad = ref<Calidad>({ ...props.calidad })
watch(
  () => props.calidad,
  (newVal) => {
    calidad.value = { ...newVal }
  },
)

async function handleSave() {
  try {
    const body = {
      nombre: calidad.value.nombre,
      descripcion: calidad.value.descripcion,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${calidad.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    calidad.value = {} as Calidad
    dialogVisible.value = false
  } catch (error: any) {
    alert(error?.response?.data?.message || 'Error al guardar')
  }
}
</script>

<template>
  <div class="card flex justify-center">
    <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Calidad' : 'Crear Calidad'"
      style="width: 25rem">
      <div class="flex items-center gap-4 mb-4">
        <label for="nombre" class="font-semibold w-3">Nombre</label>
        <InputText id="nombre" v-model="calidad.nombre" class="flex-auto" autocomplete="off" autofocus />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="descripcion" class="font-semibold w-3">Descripción</label>
        <Textarea id="descripcion" v-model="calidad.descripcion" rows="3" class="flex-auto" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </Dialog>
  </div>
</template>
