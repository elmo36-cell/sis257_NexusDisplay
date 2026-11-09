<script setup lang="ts">
import type { Rol } from '@/models/rol'
import http from '@/plugins/axios'
import { Button, Dialog, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'roles'
const props = defineProps({
  mostrar: Boolean,
  rol: { type: Object as () => Rol, default: () => ({}) as Rol },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

const rol = ref<Rol>({ ...props.rol })
watch(
  () => props.rol,
  (newVal) => {
    rol.value = { ...newVal }
  },
)

async function handleSave() {
  try {
    const body = { nombre: rol.value.nombre }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${rol.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    dialogVisible.value = false
  } catch (error: any) {
    alert(error?.response?.data?.message || 'Error al guardar')
  }
}
</script>

<template>
  <div class="card flex justify-center">
    <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Rol' : 'Crear Rol'"
      style="width: 25rem">
      <div class="flex items-center gap-4 mb-4">
        <label for="nombre" class="font-semibold w-3">Nombre</label>
        <InputText id="nombre" v-model="rol.nombre" class="flex-auto" autofocus />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </Dialog>
  </div>
</template>
