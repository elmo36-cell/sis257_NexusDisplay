<script setup lang="ts">
import type { Marca } from '@/models/marca'
import type { Modelo } from '@/models/modelo'
import http from '@/plugins/axios'
import { Button, Dialog, InputText, Select } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'modelos'
const props = defineProps({
  mostrar: Boolean,
  modelo: { type: Object as () => Modelo, default: () => ({}) as Modelo },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const marcas = ref<Marca[]>([])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

const modelo = ref<Modelo>({ ...props.modelo })

async function obtenerMarcas() {
  marcas.value = await http.get('marcas').then((response) => response.data)
}

watch(
  () => props.mostrar,
  (nuevoValor) => {
    if (nuevoValor) {
      obtenerMarcas()
      if (props.modelo?.id) {
        modelo.value = {
          ...props.modelo,
          idMarca: props.modelo.idMarca || props.modelo.marca?.id || 0,
        }
      } else {
        modelo.value = { idMarca: 0 } as Modelo
      }
    }
  },
)

async function handleSave() {
  try {
    const body = {
      idMarca: modelo.value.idMarca,
      nombre: modelo.value.nombre,
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
    alert(error?.response?.data?.message || 'Error al guardar')
  }
}
</script>

<template>
  <div class="card flex justify-center">
    <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Modelo' : 'Crear Modelo'"
      style="width: 25rem">
      <div class="flex items-center gap-4 mb-4">
        <label for="marca" class="font-semibold w-3">Marca</label>
        <Select id="marca" v-model="modelo.idMarca" :options="marcas" optionLabel="nombre" optionValue="id"
          class="flex-auto" autofocus />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="nombre" class="font-semibold w-3">Nombre</label>
        <InputText id="nombre" v-model="modelo.nombre" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </Dialog>
  </div>
</template>
