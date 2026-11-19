<script setup lang="ts">
import type { Proveedor } from '@/models/proveedor'
import PaginacionTabla from '@/components/PaginacionTabla.vue'
import clienteApi from '@/plugins/axios'
import { coincideBusqueda } from '@/helpers/busqueda'
import { cargarRegistros } from '@/helpers/listas'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { usePaginacion } from '@/helpers/paginacion'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref, watch } from 'vue'

const RUTA_API = 'proveedores'
const proveedores = ref<Proveedor[]>([])
const proveedorDelete = ref<Proveedor | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const emit = defineEmits(['edit'])

const proveedoresFiltrados = computed(() =>
  proveedores.value.filter((proveedor) =>
    coincideBusqueda(busqueda.value, [proveedor.nombre, proveedor.nit]),
  ),
)

// Pagino los proveedores de 15 en 15 y los números de página de 10 en 10.
const { paginaActual, totalPaginas, filasPagina, inicioRango, finRango, paginasBloque, irAPagina, irABloque } =
  usePaginacion(proveedoresFiltrados)

watch(busqueda, () => irAPagina(1))

async function obtenerLista() {
  await cargarRegistros(proveedores, RUTA_API, 'No se pudo cargar la lista de proveedores')
}

function emitirEdicion(proveedor: Proveedor) {
  emit('edit', proveedor)
}

function mostrarEliminarConfirm(proveedor: Proveedor) {
  proveedorDelete.value = proveedor
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  try {
    await clienteApi.delete(`${RUTA_API}/${proveedorDelete.value?.id}`)
    await obtenerLista()
    mostrarConfirmDialog.value = false
    notify.success('Proveedor eliminado correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'No se pudo eliminar el proveedor'))
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
        <InputText v-model="busqueda" type="text" placeholder="Buscar proveedor por nombre o NIT" />
      </InputGroup>
    </div>

    <div class="table-responsive">
      <table class="w-full border-collapse">
        <thead>
          <tr class="surface-200 text-left">
            <th class="p-2">Nro.</th>
            <th class="p-2">Nombre / Empresa</th>
            <th class="p-2">NIT</th>
            <th class="p-2">Teléfono</th>
            <th class="p-2">Dirección</th>
            <th class="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(proveedor, indice) in filasPagina" :key="proveedor.id"
            class="border-bottom-1 surface-border">
            <td class="p-2">{{ inicioRango + indice }}</td>
            <td class="p-2 font-semibold">{{ proveedor.nombre }}</td>
            <td class="p-2">{{ proveedor.nit }}</td>
            <td class="p-2">{{ proveedor.telefono }}</td>
            <td class="p-2">{{ proveedor.direccion }}</td>
            <td class="p-2">
              <Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(proveedor)" />
              <Button icon="pi pi-trash" aria-label="Eliminar" text severity="danger"
                @click="mostrarEliminarConfirm(proveedor)" />
            </td>
          </tr>
          <tr v-if="!proveedoresFiltrados.length">
            <td colspan="6" class="text-center py-4 muted">No hay proveedores registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginacionTabla :pagina-actual="paginaActual" :total-paginas="totalPaginas"
      :inicio-rango="inicioRango" :fin-rango="finRango" :total-registros="proveedoresFiltrados.length"
      :paginas-bloque="paginasBloque" etiqueta="proveedores" aria-label="Paginación de proveedores"
      @ir-a-pagina="irAPagina" @ir-a-bloque="irABloque" />

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>¿Estás seguro de eliminar al proveedor <strong>{{ proveedorDelete?.nombre }}</strong>?</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
