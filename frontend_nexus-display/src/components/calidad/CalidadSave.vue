<script setup lang="ts">
import type { Calidad } from '@/models/calidad'
import http from '@/plugins/axios'
import { Button, Dialog, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'calidades'
const props = defineProps({
  mostrar: Boolean,
  calidad: {
    type: Object as () => Calidad,
    default: () => ({}) as Calidad,
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
    alert(error?.response?.data?.message || 'Error al guardar calidad')
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Calidad' : 'Crear Calidad'"
    style="width: 25rem" modal>
    <div class="flex flex-column gap-3">
      <div>
        <label class="font-semibold block mb-1">Nombre</label>
        <InputText v-model="calidad.nombre" class="w-full" placeholder="Ej: Original, OLED, Incell" autofocus />
      </div>
      <div>
        <label class="font-semibold block mb-1">Descripción</label>
        <InputText v-model="calidad.descripcion" class="w-full" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </div>
  </Dialog>
</template>
