<script setup lang="ts">
import type { Calidad } from '@/models/calidad'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'calidades'
const calidades = ref<Calidad[]>([])
const calidadDelete = ref<Calidad | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const emit = defineEmits(['edit'])

const calidadesFiltradas = computed(() => {
  return calidades.value.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(busqueda.value.toLowerCase()),
  )
})

async function obtenerLista() {
  calidades.value = await http.get(ENDPOINT).then((response) => response.data)
}

function emitirEdicion(calidad: Calidad) {
  emit('edit', calidad)
}

function mostrarEliminarConfirm(calidad: Calidad) {
  calidadDelete.value = calidad
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${calidadDelete.value?.id}`)
  obtenerLista()
  mostrarConfirmDialog.value = false
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

    <table class="table table-bordered table-striped">
      <thead>
        <tr>
          <th>Nro.</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(calidad, index) in calidadesFiltradas" :key="calidad.id">
          <td>{{ index + 1 }}</td>
          <td>{{ calidad.nombre }}</td>
          <td>{{ calidad.descripcion }}</td>
          <td>
            <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(calidad)" />
            <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
              @click="mostrarEliminarConfirm(calidad)" />
          </td>
        </tr>
        <tr v-if="calidadesFiltradas.length === 0">
          <td colspan="4">No se encontraron resultados.</td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de que deseas eliminar la calidad <b>{{ calidadDelete?.nombre }}</b>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
