<script setup lang="ts">
import type { Usuario } from '@/models/usuario'
import http from '@/plugins/axios'
import { useAuthStore } from '@/stores'
import { Button, Dialog, InputText, Select, Checkbox } from 'primevue'
import { computed, ref, watch } from 'vue'
import type { AxiosError } from 'axios'

const authStore = useAuthStore()
const ENDPOINT = 'usuarios'
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

// Si es ADMIN puede elegir ADMIN, VENDEDOR o CLIENTE; si es VENDEDOR solo puede añadir CLIENTE
const rolesDisponibles = computed(() => {
  if (authStore.rol === 'ADMIN') {
    return ['ADMIN', 'VENDEDOR', 'CLIENTE']
  }
  return ['CLIENTE']
})

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

watch(
  () => props.mostrar,
  (newVal) => {
    if (newVal) {
      usuario.value = {
        ...props.usuario,
        rol: authStore.rol === 'ADMIN' ? props.usuario?.rol || 'CLIENTE' : 'CLIENTE',
        telefono: props.usuario?.telefono || '',
        clave: '',
        activo: props.usuario?.activo ?? true,
      }
    }
  },
)

async function handleSave() {
  try {
    const body: Record<string, unknown> = {
      nombreUsuario: usuario.value.nombreUsuario,
      correo: usuario.value.correo,
      telefono: usuario.value.telefono,
      rol: authStore.rol === 'ADMIN' ? usuario.value.rol : 'CLIENTE',
      activo: Boolean(usuario.value.activo),
    }
    if (usuario.value.clave && usuario.value.clave.trim() !== '') {
      body.clave = usuario.value.clave
    }
    if (props.modoEdicion && authStore.rol === 'ADMIN') {
      await http.patch(`${ENDPOINT}/${usuario.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    usuario.value = {} as Usuario
    dialogVisible.value = false
    alert('Usuario guardado correctamente')
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>
    alert(err.response?.data?.message || 'Error al guardar usuario')
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogVisible" :header="authStore.rol === 'ADMIN'
    ? props.modoEdicion
      ? 'Editar Usuario (Rol / Teléfono / Contraseña)'
      : 'Crear Usuario (Cliente / Vendedor / Admin)'
    : 'Añadir Nuevo Cliente'
    " :style="{ width: '28rem' }" modal>
    <div class="d-flex flex-column gap-3 pt-2">
      <div class="d-flex flex-column gap-1">
        <label class="fw-semibold">Rol</label>
        <Select v-model="usuario.rol" :options="rolesDisponibles" :disabled="authStore.rol !== 'ADMIN'"
          placeholder="Seleccione un rol" class="w-100" />
        <small v-if="authStore.rol === 'VENDEDOR'" class="text-muted">
          Como VENDEDOR solo puedes añadir nuevos usuarios con el rol CLIENTE.
        </small>
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
        <label class="fw-semibold">
          {{ props.modoEdicion ? 'Nueva Contraseña (opcional)' : 'Contraseña' }}
        </label>
        <InputText v-model="usuario.clave" type="password" placeholder="Mínimo 6 caracteres" class="w-100" />
      </div>

      <div v-if="authStore.rol === 'ADMIN'" class="d-flex align-items-center gap-2 mt-1">
        <Checkbox v-model="usuario.activo" :binary="true" inputId="activoCheck" />
        <label for="activoCheck" class="fw-semibold mb-0">Usuario Activo</label>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-3">
        <Button type="button" label="Cancelar" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" @click="handleSave" />
      </div>
    </div>
  </Dialog>
</template>
