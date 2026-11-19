<script setup lang="ts">
import type { Calidad } from '@/models/calidad'
import clienteApi from '@/plugins/axios'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

const RUTA_API = 'calidades'
const props = defineProps({
  mostrar: Boolean,
  calidad: {
    type: Object as () => Calidad,
    default: () => ({}) as Calidad,
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

const calidad = ref<Calidad>({ ...props.calidad })
watch(
  () => props.calidad,
  (nuevoValor) => {
    calidad.value = { ...nuevoValor }
  },
)

async function guardarCambios() {
  try {
    const cuerpo = {
      nombre: calidad.value.nombre,
      descripcion: calidad.value.descripcion,
    }
    if (props.modoEdicion) {
      await clienteApi.patch(`${RUTA_API}/${calidad.value.id}`, cuerpo)
    } else {
      await clienteApi.post(RUTA_API, cuerpo)
    }
    emit('guardar')
    calidad.value = {} as Calidad
    dialogoVisible.value = false
    notify.success('Calidad guardada correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'Error al guardar la calidad'))
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogoVisible" :header="props.modoEdicion ? 'Editar Calidad' : 'Crear Calidad'"
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
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogoVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="guardarCambios" />
      </div>
    </div>
  </Dialog>
</template>
