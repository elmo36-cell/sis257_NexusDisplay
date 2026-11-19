<script setup lang="ts">
import type { Marca } from '@/models/marca'
import clienteApi from '@/plugins/axios'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

const RUTA_API = 'marcas'
const props = defineProps({
  mostrar: Boolean,
  marca: {
    type: Object as () => Marca,
    default: () => ({}) as Marca,
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

const marca = ref<Marca>({ ...props.marca })
watch(
  () => props.marca,
  (nuevoValor) => {
    marca.value = { ...nuevoValor }
  },
)

async function guardarCambios() {
  try {
    const cuerpo = {
      nombre: marca.value.nombre,
      fotografia: marca.value.fotografia,
    }
    if (props.modoEdicion) {
      await clienteApi.patch(`${RUTA_API}/${marca.value.id}`, cuerpo)
    } else {
      await clienteApi.post(RUTA_API, cuerpo)
    }
    emit('guardar')
    marca.value = {} as Marca
    dialogoVisible.value = false
    notify.success('Marca guardada correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'Error al guardar la marca'))
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogoVisible" :header="props.modoEdicion ? 'Editar Marca' : 'Crear Marca'"
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
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogoVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="guardarCambios" />
      </div>
    </div>
  </Dialog>
</template>
