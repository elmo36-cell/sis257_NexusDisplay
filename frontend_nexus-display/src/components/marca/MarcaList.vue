<script setup lang="ts">
import type { Marca } from '@/models/marca'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'marcas'
const marcas = ref<Marca[]>([])
const marcaDelete = ref<Marca | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const emit = defineEmits(['edit'])

const marcasFiltradas = computed(() => {
  return marcas.value.filter((marca) =>
    marca.nombre.toLowerCase().includes(busqueda.value.toLowerCase()),
  )
})

async function obtenerLista() {
  marcas.value = await http.get(ENDPOINT).then((response) => response.data)
}

function emitirEdicion(marca: Marca) {
  emit('edit', marca)
}

function mostrarEliminarConfirm(marca: Marca) {
  marcaDelete.value = marca
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  await http.delete(`${ENDPOINT}/${marcaDelete.value?.id}`)
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
        <InputText v-model="busqueda" type="text" placeholder="Buscar por nombre" />
      </InputGroup>
    </div>

    <table class="table table-bordered table-striped">
      <thead>
        <tr>
          <th>Nro.</th>
          <th>Nombre</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(marca, index) in marcasFiltradas" :key="marca.id">
          <td>{{ index + 1 }}</td>
          <td>{{ marca.nombre }}</td>
          <td>
            <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(marca)" />
            <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
              @click="mostrarEliminarConfirm(marca)" />
          </td>
        </tr>
        <tr v-if="marcasFiltradas.length === 0">
          <td colspan="3">No se encontraron resultados.</td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de que deseas eliminar la marca <b>{{ marcaDelete?.nombre }}</b>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
