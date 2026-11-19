<script setup lang="ts">
import type { Almacen } from '@/models/almacen'
import clienteApi from '@/plugins/axios'
import { useSesionStore } from '@/stores'
import { coincideBusqueda } from '@/helpers/busqueda'
import { cargarRegistros } from '@/helpers/listas'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const sesion = useSesionStore()
const RUTA_API = 'almacenes'
const almacenes = ref<Almacen[]>([])
const almacenDelete = ref<Almacen | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const emit = defineEmits(['edit'])

const almacenesFiltrados = computed(() =>
  almacenes.value.filter((almacen) =>
    coincideBusqueda(busqueda.value, [almacen.nombre, almacen.direccion]),
  ),
)

async function obtenerLista() {
  await cargarRegistros(almacenes, RUTA_API, 'No se pudo cargar la lista de almacenes')
}

function emitirEdicion(almacen: Almacen) {
  emit('edit', almacen)
}

function mostrarEliminarConfirm(almacen: Almacen) {
  almacenDelete.value = almacen
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  try {
    await clienteApi.delete(`${RUTA_API}/${almacenDelete.value?.id}`)
    await obtenerLista()
    mostrarConfirmDialog.value = false
    notify.success('Almacén eliminado correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'No se pudo eliminar el almacén'))
  }
}

onMounted(() => {
  obtenerLista()
})
defineExpose({ obtenerLista })
</script>

<template>
  <div>
    <div class="col-12 col-md-6 pl-0 mt-3 mb-3">
      <InputText v-model="busqueda" type="text" placeholder="Buscar almacén o dirección..." class="w-100" />
    </div>

    <div class="table-responsive">
      <table class="table table-hover align-middle bg-white shadow-sm rounded">
        <thead class="table-dark">
          <tr>
            <th>Nro.</th>
            <th>Nombre del Almacén</th>
            <th>Dirección</th>
            <th v-if="sesion.rol === 'ADMIN'">Teléfono</th>
            <th v-if="sesion.rol === 'ADMIN'">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(almacen, indice) in almacenesFiltrados" :key="almacen.id">
            <td>{{ indice + 1 }}</td>
            <td class="fw-bold text-dark">{{ almacen.nombre }}</td>
            <td>{{ almacen.direccion }}</td>
            <td v-if="sesion.rol === 'ADMIN'">{{ almacen.telefono || 'Sin teléfono' }}</td>
            <td v-if="sesion.rol === 'ADMIN'">
              <Button label="Editar" text @click="emitirEdicion(almacen)" />
              <Button label="Eliminar" text severity="danger" @click="mostrarEliminarConfirm(almacen)" />
            </td>
          </tr>
          <tr v-if="!almacenesFiltrados.length">
            <td colspan="5" class="text-center py-4 muted">No hay almacenes registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de eliminar el almacén <strong>{{ almacenDelete?.nombre }}</strong>?</p>
      <div class="d-flex justify-content-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
