<script setup lang="ts">
import type { Calidad } from '@/models/calidad'
import type { Categoria } from '@/models/categoria'
import type { Modelo } from '@/models/modelo'
import type { Pantalla } from '@/models/pantalla'
import http from '@/plugins/axios'
import { Button, Dialog, InputNumber, InputText, Select, Textarea } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'pantallas'
const props = defineProps({
  mostrar: Boolean,
  pantalla: { type: Object as () => Pantalla, default: () => ({}) as Pantalla },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const modelos = ref<Modelo[]>([])
const categorias = ref<Categoria[]>([])
const calidades = ref<Calidad[]>([])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

const pantalla = ref<Pantalla>({ ...props.pantalla })

async function cargarRelaciones() {
  modelos.value = await http.get('modelos').then((r) => r.data)
  categorias.value = await http.get('categorias').then((r) => r.data)
  calidades.value = await http.get('calidades').then((r) => r.data)
}

watch(
  () => props.mostrar,
  (nuevoValor) => {
    if (nuevoValor) {
      cargarRelaciones()
      if (props.pantalla?.id) {
        pantalla.value = {
          ...props.pantalla,
          idModelo: props.pantalla.idModelo || props.pantalla.modelo?.id || 0,
          idCategoria: props.pantalla.idCategoria || props.pantalla.categoria?.id || 0,
          idCalidad: props.pantalla.idCalidad || props.pantalla.calidad?.id || 0,
        }
      } else {
        pantalla.value = { precio: 0 } as Pantalla
      }
    }
  },
)

async function handleSave() {
  try {
    const body = {
      nombre: pantalla.value.nombre,
      descripcion: pantalla.value.descripcion,
      precio: Number(pantalla.value.precio),
      idModelo: pantalla.value.idModelo,
      idCategoria: pantalla.value.idCategoria,
      idCalidad: pantalla.value.idCalidad,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${pantalla.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    pantalla.value = {} as Pantalla
    dialogVisible.value = false
  } catch (error: any) {
    alert(error?.response?.data?.message || 'Error al guardar')
  }
}
</script>

<template>
  <div class="card flex justify-center">
    <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Pantalla' : 'Crear Pantalla'"
      style="width: 30rem">
      <div class="flex items-center gap-4 mb-4">
        <label for="nombre" class="font-semibold w-3">Nombre</label>
        <InputText id="nombre" v-model="pantalla.nombre" class="flex-auto" autocomplete="off" autofocus />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="modelo" class="font-semibold w-3">Modelo</label>
        <Select id="modelo" v-model="pantalla.idModelo" :options="modelos" optionLabel="nombre" optionValue="id"
          class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="categoria" class="font-semibold w-3">Categoría</label>
        <Select id="categoria" v-model="pantalla.idCategoria" :options="categorias" optionLabel="nombre"
          optionValue="id" class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="calidad" class="font-semibold w-3">Calidad</label>
        <Select id="calidad" v-model="pantalla.idCalidad" :options="calidades" optionLabel="nombre" optionValue="id"
          class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="precio" class="font-semibold w-3">Precio (Bs)</label>
        <InputNumber id="precio" v-model="pantalla.precio" mode="decimal" :minFractionDigits="2" class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="descripcion" class="font-semibold w-3">Descripción</label>
        <Textarea id="descripcion" v-model="pantalla.descripcion" rows="2" class="flex-auto" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </Dialog>
  </div>
</template>
