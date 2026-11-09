<script setup lang="ts">
import type { Pantalla } from '@/models/pantalla'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'pantallas'
const pantallas = ref<Pantalla[]>([])
const pantallaDelete = ref<Pantalla | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const emit = defineEmits(['edit'])

const pantallasFiltradas = computed(() => {
  return pantallas.value.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      p.modelo?.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      p.calidad?.nombre.toLowerCase().includes(busqueda.value.toLowerCase()),
  )
})

async function obtenerLista() {
  pantallas.value = await http.get(ENDPOINT).then((response) => response.data)
}

function emitirEdicion(pantalla: Pantalla) {
  emit('edit', pantalla)
}

function mostrarEliminarConfirm(pantalla: Pantalla) {
  pantallaDelete.value = pantalla
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${pantallaDelete.value?.id}`)
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
        <InputText v-model="busqueda" type="text" placeholder="Buscar por nombre, modelo o calidad" />
      </InputGroup>
    </div>

    <table class="table table-bordered table-striped">
      <thead>
        <tr>
          <th>Nro.</th>
          <th>Nombre</th>
          <th>Modelo</th>
          <th>Categoría</th>
          <th>Calidad</th>
          <th>Precio (Bs)</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(pantalla, index) in pantallasFiltradas" :key="pantalla.id">
          <td>{{ index + 1 }}</td>
          <td>{{ pantalla.nombre }}</td>
          <td>{{ pantalla.modelo?.nombre }}</td>
          <td>{{ pantalla.categoria?.nombre }}</td>
          <td>{{ pantalla.calidad?.nombre }}</td>
          <td>{{ pantalla.precio }}</td>
          <td>
            <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(pantalla)" />
            <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
              @click="mostrarEliminarConfirm(pantalla)" />
          </td>
        </tr>
        <tr v-if="pantallasFiltradas.length === 0">
          <td colspan="7">No se encontraron resultados.</td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de que deseas eliminar la pantalla <b>{{ pantallaDelete?.nombre }}</b>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
