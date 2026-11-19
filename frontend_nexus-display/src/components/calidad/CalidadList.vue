<script setup lang="ts">
import type { Calidad } from '@/models/calidad'
import clienteApi from '@/plugins/axios'
import { coincideBusqueda } from '@/helpers/busqueda'
import { cargarRegistros } from '@/helpers/listas'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const RUTA_API = 'calidades'
const calidades = ref<Calidad[]>([])
const calidadDelete = ref<Calidad | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const emit = defineEmits(['edit'])

const calidadesFiltradas = computed(() =>
  calidades.value.filter((calidad) => coincideBusqueda(busqueda.value, [calidad.nombre])),
)

async function obtenerLista() {
  await cargarRegistros(calidades, RUTA_API, 'No se pudo cargar la lista de calidades')
}

function emitirEdicion(calidad: Calidad) {
  emit('edit', calidad)
}

function mostrarEliminarConfirm(calidad: Calidad) {
  calidadDelete.value = calidad
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  try {
    await clienteApi.delete(`${RUTA_API}/${calidadDelete.value?.id}`)
    await obtenerLista()
    mostrarConfirmDialog.value = false
    notify.success('Calidad eliminada correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'No se pudo eliminar la calidad'))
  }
}

onMounted(() => {
  obtenerLista()
})
defineExpose({ obtenerLista })
</script>

<template>
  <div>
    <div class="col-7 pl-0 mt-3 mb-3">
      <InputGroup>
        <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
        <InputText v-model="busqueda" type="text" placeholder="Buscar calidad" />
      </InputGroup>
    </div>

    <div class="table-responsive">
      <table class="w-full border-collapse">
        <thead>
          <tr class="surface-200 text-left">
            <th class="p-2">Nro.</th>
            <th class="p-2">Nombre</th>
            <th class="p-2">Descripción</th>
            <th class="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(calidad, indice) in calidadesFiltradas" :key="calidad.id" class="border-bottom-1 surface-border">
            <td class="p-2">{{ indice + 1 }}</td>
            <td class="p-2 font-semibold">{{ calidad.nombre }}</td>
            <td class="p-2">{{ calidad.descripcion }}</td>
            <td class="p-2">
              <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(calidad)" />
              <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
                @click="mostrarEliminarConfirm(calidad)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de eliminar la calidad <strong>{{ calidadDelete?.nombre }}</strong>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
