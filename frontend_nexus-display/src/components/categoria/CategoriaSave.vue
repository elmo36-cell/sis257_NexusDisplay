<script setup lang="ts">
import type { Categoria } from '@/models/categoria'
import clienteApi from '@/plugins/axios'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'

const RUTA_API = 'categorias'
const props = defineProps({
  mostrar: Boolean,
  categoria: {
    type: Object as () => Categoria,
    default: () => ({}) as Categoria,
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

const categoria = ref<Categoria>({ ...props.categoria })
watch(
  () => props.categoria,
  (nuevoValor) => {
    categoria.value = { ...nuevoValor }
  },
)

async function guardarCambios() {
  try {
    const cuerpo = {
      nombre: categoria.value.nombre,
      descripcion: categoria.value.descripcion,
    }
    if (props.modoEdicion) {
      await clienteApi.patch(`${RUTA_API}/${categoria.value.id}`, cuerpo)
    } else {
      await clienteApi.post(RUTA_API, cuerpo)
    }
    emit('guardar')
    categoria.value = {} as Categoria
    dialogoVisible.value = false
    notify.success('Categoría guardada correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'Error al guardar la categoría'))
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogoVisible" :header="props.modoEdicion ? 'Editar Categoría' : 'Crear Categoría'"
    style="width: 25rem" modal>
    <div class="flex flex-column gap-3">
      <div>
        <label class="font-semibold block mb-1">Nombre</label>
        <InputText v-model="categoria.nombre" class="w-full" autofocus />
      </div>
      <div>
        <label class="font-semibold block mb-1">Descripción</label>
        <InputText v-model="categoria.descripcion" class="w-full" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogoVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="guardarCambios" />
      </div>
    </div>
  </Dialog>
</template>
