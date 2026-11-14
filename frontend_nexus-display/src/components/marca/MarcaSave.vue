<script setup lang="ts">
import type { Marca } from '@/models/marca'
import http from '@/plugins/axios'
import { Button, Dialog, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'marcas'
const props = defineProps({
  mostrar: Boolean,
  marca: {
    type: Object as () => Marca,
    default: () => ({}) as Marca,
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

const marca = ref<Marca>({ ...props.marca })
watch(
  () => props.marca,
  (newVal) => {
    marca.value = { ...newVal }
  },
)

async function handleSave() {
  try {
    const body = {
      nombre: marca.value.nombre,
      fotografia: marca.value.fotografia,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${marca.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    marca.value = {} as Marca
    dialogVisible.value = false
  } catch (error: any) {
    alert(error?.response?.data?.message || 'Error al guardar la marca')
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Marca' : 'Crear Marca'"
    style="width: 25rem" modal>
    <div class="flex flex-column gap-3">
      <div>
        <label for="nombre" class="font-semibold block mb-1">Nombre</label>
        <InputText id="nombre" v-model="marca.nombre" class="w-full" autocomplete="off" autofocus />
      </div>
      <div>
        <label for="fotografia" class="font-semibold block mb-1">URL Logo / Fotografía</label>
        <InputText id="fotografia" v-model="marca.fotografia" class="w-full" autocomplete="off" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </div>
  </Dialog>
</template>
