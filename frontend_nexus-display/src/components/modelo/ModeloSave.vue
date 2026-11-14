<script setup lang="ts">
import type { Modelo } from '@/models/modelo'
import type { Marca } from '@/models/marca'
import http from '@/plugins/axios'
import { Button, Dialog, InputText, Select } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'modelos'
const props = defineProps({
  mostrar: Boolean,
  modelo: {
    type: Object as () => Modelo,
    default: () => ({}) as Modelo,
  },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const marcas = ref<Marca[]>([])
const modelo = ref<Modelo>({ ...props.modelo })

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

async function obtenerMarcas() {
  marcas.value = await http.get('marcas').then((response) => response.data)
}

watch(
  () => props.mostrar,
  (newVal) => {
    if (newVal) {
      obtenerMarcas()
      modelo.value = { ...props.modelo }
    }
  },
)

async function handleSave() {
  try {
    const body = {
      idMarca: modelo.value.idMarca,
      nombre: modelo.value.nombre,
      fotografia: modelo.value.fotografia,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${modelo.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    modelo.value = {} as Modelo
    dialogVisible.value = false
  } catch (error: any) {
    alert(error?.response?.data?.message || 'Error al guardar el modelo')
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Modelo' : 'Crear Modelo'"
    style="width: 25rem" modal>
    <div class="flex flex-column gap-3">
      <div>
        <label class="font-semibold block mb-1">Marca</label>
        <Select v-model="modelo.idMarca" :options="marcas" optionLabel="nombre" optionValue="id"
          placeholder="Seleccione una marca" class="w-full" />
      </div>
      <div>
        <label class="font-semibold block mb-1">Nombre del Modelo</label>
        <InputText v-model="modelo.nombre" class="w-full" placeholder="Ej: Galaxy A54 5G" />
      </div>
      <div>
        <label class="font-semibold block mb-1">URL Fotografía</label>
        <InputText v-model="modelo.fotografia" class="w-full" placeholder="https://..." />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </div>
  </Dialog>
</template>
