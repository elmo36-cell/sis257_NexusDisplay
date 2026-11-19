<script setup lang="ts">
import type { Modelo } from '@/models/modelo'
import type { Marca } from '@/models/marca'
import clienteApi from '@/plugins/axios'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputText, Select } from 'primevue'
import { computed, ref, watch } from 'vue'

const RUTA_API = 'modelos'
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

const dialogoVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

async function obtenerMarcas() {
  marcas.value = await clienteApi.get('marcas').then((response) => response.data)
}

watch(
  () => props.mostrar,
  (nuevoValor) => {
    if (nuevoValor) {
      obtenerMarcas()
      modelo.value = { ...props.modelo }
    }
  },
)

async function guardarCambios() {
  try {
    const cuerpo = {
      idMarca: modelo.value.idMarca,
      nombre: modelo.value.nombre,
      fotografia: modelo.value.fotografia,
    }
    if (props.modoEdicion) {
      await clienteApi.patch(`${RUTA_API}/${modelo.value.id}`, cuerpo)
    } else {
      await clienteApi.post(RUTA_API, cuerpo)
    }
    emit('guardar')
    modelo.value = {} as Modelo
    dialogoVisible.value = false
    notify.success('Modelo guardado correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'Error al guardar el modelo'))
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogoVisible" :header="props.modoEdicion ? 'Editar Modelo' : 'Crear Modelo'"
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
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogoVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="guardarCambios" />
      </div>
    </div>
  </Dialog>
</template>
