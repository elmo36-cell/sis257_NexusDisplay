<script setup lang="ts">
import type { Usuario } from '@/models/usuario'
import type { Almacen } from '@/models/almacen'
import clienteApi from '@/plugins/axios'
import { useSesionStore } from '@/stores'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import { Button, Dialog, InputText, Select, Checkbox } from 'primevue'
import { computed, onMounted, ref, watch } from 'vue'

const sesion = useSesionStore()
const RUTA_API = 'usuarios'
const props = defineProps({
  mostrar: Boolean,
  usuario: {
    type: Object as () => Usuario,
    default: () => ({}) as Usuario,
  },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const usuario = ref<Usuario>({ ...props.usuario })
const almacenes = ref<Almacen[]>([])

async function cargarAlmacenes() {
  if (sesion.rol !== 'ADMIN') return
  try {
    const { data } = await clienteApi.get('almacenes')
    almacenes.value = Array.isArray(data) ? data : []
  } catch {
    almacenes.value = []
  }
}

onMounted(cargarAlmacenes)

// Si es ADMIN puede elegir ADMIN, VENDEDOR o CLIENTE; si es VENDEDOR solo puede añadir CLIENTE
const rolesDisponibles = computed(() => {
  if (sesion.rol === 'ADMIN') {
    return ['ADMIN', 'VENDEDOR', 'CLIENTE']
  }
  return ['CLIENTE']
})

const dialogoVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

watch(
  () => props.mostrar,
  (nuevoValor) => {
    if (nuevoValor) {
      usuario.value = {
        ...props.usuario,
        rol: sesion.rol === 'ADMIN' ? props.usuario?.rol || 'CLIENTE' : 'CLIENTE',
        nombre: props.usuario?.nombre || '',
        primerApellido: props.usuario?.primerApellido || '',
        segundoApellido: props.usuario?.segundoApellido || '',
        telefono: props.usuario?.telefono || '',
        documento: props.usuario?.documento || '',
        idAlmacen: props.usuario?.idAlmacen ?? null,
        clave: '',
        activo: props.usuario?.activo ?? true,
      }
    }
  },
)

// Armo el cuerpo solo con lo que el backend espera. La clave se manda nada más
// si escribieron una nueva, y el rol lo fija el servidor según quién está logueado.
async function guardarCambios() {
  try {
    const cuerpo: Record<string, unknown> = {
      nombreUsuario: usuario.value.nombreUsuario,
      nombre: usuario.value.nombre?.trim() || undefined,
      primerApellido: usuario.value.primerApellido?.trim() || undefined,
      segundoApellido: usuario.value.segundoApellido?.trim() || undefined,
      correo: usuario.value.correo,
      telefono: usuario.value.telefono,
      // Si dejo el NIT / CI vacío mando undefined para no borrar el que ya
      // tenía el usuario en la base.
      documento: usuario.value.documento?.trim() || undefined,
      rol: sesion.rol === 'ADMIN' ? usuario.value.rol : 'CLIENTE',
      activo: Boolean(usuario.value.activo),
    }
    if (usuario.value.clave && usuario.value.clave.trim() !== '') {
      cuerpo.clave = usuario.value.clave
    }
    // La sucursal se guarda tanto para vendedores como para clientes, así en la
    // tabla de usuarios se puede filtrar por sucursal y encontrar a un cliente.
    if (sesion.rol === 'ADMIN' && usuario.value.rol !== 'ADMIN') {
      cuerpo.idAlmacen = usuario.value.idAlmacen ? Number(usuario.value.idAlmacen) : null
    }
    if (props.modoEdicion && sesion.rol === 'ADMIN') {
      await clienteApi.patch(`${RUTA_API}/${usuario.value.id}`, cuerpo)
    } else {
      await clienteApi.post(RUTA_API, cuerpo)
    }
    emit('guardar')
    usuario.value = {} as Usuario
    dialogoVisible.value = false
    notify.success('Usuario guardado correctamente')
  } catch (error) {
    notify.error(mensajeDeError(error, 'Error al guardar el usuario'))
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogoVisible" :header="sesion.rol === 'ADMIN'
    ? props.modoEdicion
      ? 'Editar Usuario (Rol / Teléfono / Contraseña)'
      : 'Crear Usuario (Cliente / Vendedor / Admin)'
    : 'Añadir Nuevo Cliente'
    " :style="{ width: '28rem' }" modal>
    <div class="d-flex flex-column gap-3 pt-2">
      <div class="d-flex flex-column gap-1">
        <label class="fw-semibold">Rol</label>
        <Select v-model="usuario.rol" :options="rolesDisponibles" :disabled="sesion.rol !== 'ADMIN'"
          placeholder="Seleccione un rol" class="w-100" />
        <small v-if="sesion.rol === 'VENDEDOR'" class="text-muted">
          Como VENDEDOR solo puedes añadir nuevos usuarios con el rol CLIENTE.
        </small>
      </div>

      <div v-if="sesion.rol === 'ADMIN' && usuario.rol !== 'ADMIN'" class="d-flex flex-column gap-1">
        <label class="fw-semibold">Sucursal asignada</label>
        <Select v-model="usuario.idAlmacen" :options="almacenes" optionLabel="nombre" optionValue="id"
          :placeholder="usuario.rol === 'VENDEDOR' ? 'Seleccione la sucursal del vendedor' : 'Seleccione la sucursal del cliente'"
          showClear filter class="w-100" />
        <small v-if="usuario.rol === 'VENDEDOR'" class="text-muted">
          El vendedor solo verá y registrará ventas de esta sucursal.
        </small>
        <small v-else class="text-muted">Sirve para ubicar al cliente por sucursal en la lista de usuarios.</small>
      </div>

      <div class="row g-2">
        <div class="col-12 col-sm-6 d-flex flex-column gap-1">
          <label class="fw-semibold">Nombre</label>
          <InputText v-model="usuario.nombre" class="w-100" placeholder="Ej: Juan" />
        </div>
        <div class="col-12 col-sm-6 d-flex flex-column gap-1">
          <label class="fw-semibold">Primer apellido</label>
          <InputText v-model="usuario.primerApellido" class="w-100" placeholder="Ej: Pérez" />
        </div>
        <div class="col-12 d-flex flex-column gap-1">
          <label class="fw-semibold">Segundo apellido</label>
          <InputText v-model="usuario.segundoApellido" class="w-100" placeholder="Ej: Gómez" />
        </div>
      </div>

      <div class="d-flex flex-column gap-1">
        <label class="fw-semibold">Nombre de Usuario</label>
        <InputText v-model="usuario.nombreUsuario" class="w-100" placeholder="Ej: cliente_nuevo" />
      </div>

      <div class="d-flex flex-column gap-1">
        <label class="fw-semibold">Correo Electrónico</label>
        <InputText v-model="usuario.correo" class="w-100" placeholder="correo@ejemplo.com" />
      </div>

      <div class="d-flex flex-column gap-1">
        <label class="fw-semibold">Teléfono / Celular de Contacto</label>
        <InputText v-model="usuario.telefono" class="w-100" placeholder="Ej: 71234567" />
      </div>

      <div class="d-flex flex-column gap-1">
        <label class="fw-semibold">NIT / CI</label>
        <InputText v-model="usuario.documento" class="w-100" placeholder="Ej: 7123456" />
      </div>

      <div class="d-flex flex-column gap-1">
        <label class="fw-semibold">
          {{ props.modoEdicion ? 'Nueva Contraseña (opcional)' : 'Contraseña' }}
        </label>
        <InputText v-model="usuario.clave" type="password" placeholder="Mínimo 6 caracteres" class="w-100" />
      </div>

      <div v-if="sesion.rol === 'ADMIN'" class="d-flex align-articulos-center gap-2 mt-1">
        <Checkbox v-model="usuario.activo" :binary="true" inputId="activoCheck" />
        <label for="activoCheck" class="fw-semibold mb-0">Usuario Activo</label>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-3">
        <Button type="button" label="Cancelar" severity="secondary" @click="dialogoVisible = false" />
        <Button type="button" label="Guardar" @click="guardarCambios" />
      </div>
    </div>
  </Dialog>
</template>
