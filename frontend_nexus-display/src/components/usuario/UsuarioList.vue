<script setup lang="ts">
import type { Usuario } from '@/models/usuario'
import type { Almacen } from '@/models/almacen'
import clienteApi from '@/plugins/axios'
import { useSesionStore } from '@/stores'
import { coincideBusqueda } from '@/helpers/busqueda'
import { cargarRegistros } from '@/helpers/listas'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputText, Select } from 'primevue'
import { computed, onMounted, ref, watch } from 'vue'
import { usePaginacion } from '@/helpers/paginacion'
import PaginacionTabla from '@/components/PaginacionTabla.vue'

const sesion = useSesionStore()
const RUTA_API = 'usuarios'
const usuarios = ref<Usuario[]>([])
const usuarioDelete = ref<Usuario | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const filtroRol = ref<string | null>(null)
// Filtro por sucursal: guardo el id del almacén y lo comparo con el idAlmacen
// de cada usuario para encontrar rápido a un cliente.
const filtroSucursal = ref<number | null>(null)
const almacenes = ref<Almacen[]>([])
const emit = defineEmits(['edit'])

const columnas = computed(() => (sesion.rol === 'ADMIN' ? 9 : 8))

const opcionesFiltroRol = [
  { label: 'ADMIN', value: 'ADMIN' },
  { label: 'VENDEDOR', value: 'VENDEDOR' },
  { label: 'CLIENTE', value: 'CLIENTE' },
]

const usuariosFiltrados = computed(() =>
  usuarios.value.filter(
    (u) =>
      coincideBusqueda(busqueda.value, [u.nombreUsuario, nombreCompleto(u), u.correo, u.telefono]) &&
      (!filtroRol.value || u.rol === filtroRol.value) &&
      (!filtroSucursal.value || Number(u.idAlmacen ?? 0) === filtroSucursal.value),
  ),
)

// La lista de clientes puede ser larga, así que la pagino: 15 filas por página
// y los números de página de 10 en 10. El composable hace la cuenta del rango
// que estoy mostrando para el texto "Mostrando X–Y de Z".
const { paginaActual, totalPaginas, filasPagina, inicioRango, finRango, paginasBloque, irAPagina, irABloque } =
  usePaginacion(usuariosFiltrados)

// Si cambio la búsqueda o algún filtro vuelvo a la página 1, porque los
// resultados son otros y la página anterior puede quedar vacía.
watch([busqueda, filtroRol, filtroSucursal], () => irAPagina(1))

async function obtenerLista() {
  await cargarRegistros(usuarios, RUTA_API, 'No se pudo cargar la lista de usuarios')
}

async function cargarAlmacenes() {
  // La lista de sucursales la usan los dos roles: el admin para el filtro y la
  // columna de Sucursal, y el vendedor para filtrar a sus clientes.
  try {
    const { data } = await clienteApi.get('almacenes')
    almacenes.value = Array.isArray(data) ? data : []
  } catch {
    almacenes.value = []
  }
}

function nombreCompleto(usuario: Usuario): string {
  return [usuario.nombre, usuario.primerApellido, usuario.segundoApellido]
    .filter((parte) => Boolean(parte && String(parte).trim()))
    .join(' ')
}

function nombreAlmacen(id?: number | null): string {
  if (!id) return '—'
  return almacenes.value.find((almacen) => almacen.id === id)?.nombre ?? `#${id}`
}

function emitirEdicion(usuario: Usuario) {
  emit('edit', usuario)
}

function mostrarEliminarConfirm(usuario: Usuario) {
  usuarioDelete.value = usuario
  mostrarConfirmDialog.value = true
}

async function eliminar() {
  try {
    await clienteApi.delete(`${RUTA_API}/${usuarioDelete.value?.id}`)
    await obtenerLista()
    mostrarConfirmDialog.value = false
    notify.success('Usuario eliminado correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'No se pudo eliminar el usuario'))
  }
}

onMounted(() => {
  obtenerLista()
  cargarAlmacenes()
})
defineExpose({ obtenerLista })
</script>

<template>
  <div>
    <div class="row g-3 mt-2 mb-3">
      <div class="col-12 col-md-5">
        <InputText v-model="busqueda" type="text" placeholder="Buscar por nombre, usuario, correo o teléfono..."
          class="w-100" />
      </div>
      <div v-if="sesion.rol === 'ADMIN'" class="col-12 col-md-3">
        <Select v-model="filtroRol" :options="opcionesFiltroRol" optionLabel="label" optionValue="value"
          placeholder="Filtrar por Rol" showClear class="w-100" />
      </div>
      <div class="col-12 col-md-4">
        <Select v-model="filtroSucursal" :options="almacenes" optionLabel="nombre" optionValue="id"
          placeholder="Filtrar por sucursal" showClear filter class="w-100" />
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover align-middle bg-white shadow-sm rounded">
        <thead class="table-dark">
          <tr>
            <th>Nro.</th>
            <th>Nombre de Usuario</th>
            <th>Nombre completo</th>
            <th>Correo Electrónico</th>
            <th>Teléfono / Celular</th>
            <th>Rol</th>
            <th>Sucursal</th>
            <th>Estado</th>
            <th v-if="sesion.rol === 'ADMIN'">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(u, indice) in filasPagina" :key="u.id">
            <td>{{ inicioRango + indice }}</td>
            <td class="fw-bold text-dark">{{ u.nombreUsuario }}</td>
            <td>{{ nombreCompleto(u) || 'Sin registrar' }}</td>
            <td>{{ u.correo }}</td>
            <td>{{ u.telefono || 'Sin registrar' }}</td>
            <td>
              <span class="badge px-3 py-2" :class="{
                'bg-primary text-white': u.rol === 'ADMIN',
                'bg-success text-white': u.rol === 'VENDEDOR',
                'bg-secondary text-white': u.rol === 'CLIENTE',
              }">
                {{ u.rol }}
              </span>
            </td>
            <td>
              <span v-if="u.idAlmacen" class="badge bg-light text-dark border">
                <i class="pi pi-building me-1"></i>{{ nombreAlmacen(u.idAlmacen) }}
              </span>
              <span v-else class="muted">Sin asignar</span>
            </td>
            <td>
              <span class="badge" :class="u.activo ? 'bg-success' : 'bg-danger'">
                {{ u.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td v-if="sesion.rol === 'ADMIN'">
              <Button label="Editar" text @click="emitirEdicion(u)" />
              <Button label="Eliminar" text severity="danger" @click="mostrarEliminarConfirm(u)" />
            </td>
          </tr>
          <tr v-if="!usuariosFiltrados.length">
            <td :colspan="columnas" class="text-center py-4 muted">No hay usuarios que coincidan con la búsqueda.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginacionTabla :pagina-actual="paginaActual" :total-paginas="totalPaginas"
      :inicio-rango="inicioRango" :fin-rango="finRango" :total-registros="usuariosFiltrados.length"
      :paginas-bloque="paginasBloque" etiqueta="usuarios" aria-label="Paginación de clientes"
      @ir-a-pagina="irAPagina" @ir-a-bloque="irABloque" />

    <Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
      <p>
        ¿Estás seguro de eliminar al usuario <strong>{{ usuarioDelete?.nombreUsuario }}</strong>?
      </p>
      <div class="d-flex justify-content-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
        <Button type="button" label="Eliminar" severity="danger" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>
