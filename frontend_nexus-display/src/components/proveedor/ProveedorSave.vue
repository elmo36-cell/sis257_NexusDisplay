<script setup lang="ts">
import type { Proveedor } from '@/models/proveedor'
import http from '@/plugins/axios'
import { Button, Dialog, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'proveedores'
const props = defineProps({
  mostrar: Boolean,
  proveedor: {
    type: Object as () => Proveedor,
    default: () => ({}) as Proveedor,
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

const proveedor = ref<Proveedor>({ ...props.proveedor })
watch(
  () => props.proveedor,
  (newVal) => {
    proveedor.value = { ...newVal }
  },
)

async function handleSave() {
  try {
    const body = {
      nombre: proveedor.value.nombre,
      nit: proveedor.value.nit,
      telefono: proveedor.value.telefono,
      direccion: proveedor.value.direccion,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${proveedor.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    proveedor.value = {} as Proveedor
    dialogVisible.value = false
  } catch (error: any) {
    alert(error?.response?.data?.message || 'Error al guardar proveedor')
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Proveedor' : 'Crear Proveedor'"
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
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </div>
  </Dialog>
</template>
