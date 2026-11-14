<script setup lang="ts">
import type { Pantalla } from '@/models/pantalla'
import type { Modelo } from '@/models/modelo'
import type { Calidad } from '@/models/calidad'
import type { Categoria } from '@/models/categoria'
import http from '@/plugins/axios'
import { Button, Dialog, InputText, InputNumber, Select, Checkbox } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'pantallas'
const props = defineProps({
  mostrar: Boolean,
  pantalla: {
    type: Object as () => Pantalla,
    default: () => ({}) as Pantalla,
  },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const modelos = ref<Modelo[]>([])
const calidades = ref<Calidad[]>([])
const categorias = ref<Categoria[]>([])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

const pantalla = ref<Pantalla>({ ...props.pantalla })

async function obtenerRelaciones() {
  const [resModelos, resCalidades, resCategorias] = await Promise.all([
    http.get('modelos'),
    http.get('calidades'),
    http.get('categorias'),
  ])
  modelos.value = resModelos.data
  calidades.value = resCalidades.data
  categorias.value = resCategorias.data
}

watch(
  () => props.mostrar,
  (newVal) => {
    if (newVal) {
      obtenerRelaciones()
      pantalla.value = {
        ...props.pantalla,
        color: props.pantalla?.color || 'Negro',
        conMarco: props.pantalla?.conMarco ?? false,
      }
    }
  },
)

async function handleSave() {
  try {
    const body = {
      idModelo: pantalla.value.idModelo,
      idCalidad: pantalla.value.idCalidad,
      idCategoria: pantalla.value.idCategoria,
      nombre: pantalla.value.nombre,
      codigo: pantalla.value.codigo,
      color: pantalla.value.color,
      conMarco: Boolean(pantalla.value.conMarco),
      fotografia: pantalla.value.fotografia,
      precioVenta: Number(pantalla.value.precioVenta),
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
    alert(error?.response?.data?.message || 'Error al guardar la pantalla')
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Pantalla' : 'Crear Pantalla'"
    style="width: 30rem" modal>
    <div class="flex flex-column gap-3">
      <div>
        <label class="font-semibold block mb-1">Modelo de Dispositivo</label>
        <Select v-model="pantalla.idModelo" :options="modelos" optionLabel="nombre" optionValue="id"
          placeholder="Seleccione un modelo" class="w-full" />
      </div>

      <div class="grid">
        <div class="col-6">
          <label class="font-semibold block mb-1">Calidad</label>
          <Select v-model="pantalla.idCalidad" :options="calidades" optionLabel="nombre" optionValue="id"
            placeholder="Seleccione calidad" class="w-full" />
        </div>
        <div class="col-6">
          <label class="font-semibold block mb-1">Categoría</label>
          <Select v-model="pantalla.idCategoria" :options="categorias" optionLabel="nombre" optionValue="id"
            placeholder="Seleccione categoría" class="w-full" />
        </div>
      </div>

      <div>
        <label class="font-semibold block mb-1">Nombre de la Pantalla</label>
        <InputText v-model="pantalla.nombre" class="w-full" autocomplete="off" />
      </div>

      <div class="grid">
        <div class="col-6">
          <label class="font-semibold block mb-1">Código SKU</label>
          <InputText v-model="pantalla.codigo" class="w-full" autocomplete="off" />
        </div>
        <div class="col-6">
          <label class="font-semibold block mb-1">Precio Venta (Bs.)</label>
          <InputNumber v-model="pantalla.precioVenta" mode="decimal" :minFractionDigits="2" class="w-full" />
        </div>
      </div>

      <div class="grid align-items-center">
        <div class="col-6">
          <label class="font-semibold block mb-1">Color</label>
          <InputText v-model="pantalla.color" class="w-full" autocomplete="off" />
        </div>
        <div class="col-6 flex align-items-center gap-2 mt-4">
          <Checkbox v-model="pantalla.conMarco" :binary="true" inputId="conMarcoCheck" />
          <label for="conMarcoCheck" class="font-semibold">Con Marco</label>
        </div>
      </div>

      <div>
        <label class="font-semibold block mb-1">URL Fotografía</label>
        <InputText v-model="pantalla.fotografia" class="w-full" autocomplete="off" />
      </div>

      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </div>
  </Dialog>
</template>
