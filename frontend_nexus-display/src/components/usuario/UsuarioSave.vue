<script setup lang="ts">
import type { Rol } from '@/models/rol'
import type { Usuario } from '@/models/usuario'
import http from '@/plugins/axios'
import { Button, Dialog, InputText, Select } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'usuarios'
const props = defineProps({
  mostrar: Boolean,
  usuario: { type: Object as () => Usuario, default: () => ({}) as Usuario },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const roles = ref<Rol[]>([])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

const usuario = ref<Usuario>({ ...props.usuario })

async function cargarRoles() {
  roles.value = await http.get('roles').then((r) => r.data)
}

watch(
  () => props.mostrar,
  (nuevoValor) => {
    if (nuevoValor) {
      cargarRoles()
      if (props.usuario?.id) {
        usuario.value = {
          ...props.usuario,
          idRol: props.usuario.idRol || props.usuario.rol?.id || 0,
        }
      } else {
        usuario.value = {} as Usuario
      }
    }
  },
)

async function handleSave() {
  try {
    const body = {
      usuario: usuario.value.usuario,
      email: usuario.value.email,
      idRol: usuario.value.idRol,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${usuario.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    dialogVisible.value = false
  } catch (error: any) {
    alert(error?.response?.data?.message || 'Error al guardar')
  }
}
</script>

<template>
  <div class="card flex justify-center">
    <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Usuario' : 'Crear Usuario'"
      style="width: 28rem">
      <div class="flex items-center gap-4 mb-4">
        <label for="usuario" class="font-semibold w-3">Usuario</label>
        <InputText id="usuario" v-model="usuario.usuario" class="flex-auto" autofocus />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="email" class="font-semibold w-3">Email</label>
        <InputText id="email" v-model="usuario.email" class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="rol" class="font-semibold w-3">Rol</label>
        <Select id="rol" v-model="usuario.idRol" :options="roles" optionLabel="nombre" optionValue="id"
          class="flex-auto" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </Dialog>
  </div>
</template>
