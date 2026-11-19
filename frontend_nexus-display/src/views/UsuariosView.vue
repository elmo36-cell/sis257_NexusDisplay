<script setup lang="ts">
import UsuarioList from '@/components/usuario/UsuarioList.vue'
import UsuarioSave from '@/components/usuario/UsuarioSave.vue'
import { useSesionStore } from '@/stores'
import Button from 'primevue/button'
import { ref } from 'vue'
import type { Usuario } from '@/models/usuario'

const sesion = useSesionStore()
const mostrarDialog = ref(false)
const usuarioListRef = ref<typeof UsuarioList | null>(null)
const usuarioEdit = ref<Usuario | undefined>(undefined)

function handleCreate() {
  usuarioEdit.value = undefined
  mostrarDialog.value = true
}

function handleEdit(usuario: Usuario) {
  usuarioEdit.value = usuario
  mostrarDialog.value = true
}

function handleCloseDialog() {
  mostrarDialog.value = false
}

function handleGuardar() {
  usuarioListRef.value?.obtenerLista()
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="d-flex justify-content-between align-articulos-center mb-3">
      <div>
        <h2 class="m-0">
          {{
            sesion.rol === 'ADMIN'
              ? 'Administración de Usuarios y Roles'
              : 'Gestión y Registro de Clientes'
          }}
        </h2>
        <p class="text-muted small m-0 mt-1">
          {{
            sesion.rol === 'ADMIN'
              ? 'Crea y edita administradores, vendedores y clientes.'
              : 'Como vendedor puedes visualizar la cartera de clientes y añadir nuevos clientes.'
          }}
        </p>
      </div>
      <Button :label="sesion.rol === 'ADMIN' ? 'Crear Usuario' : 'Añadir Nuevo Cliente'" @click="handleCreate" />
    </div>

    <UsuarioList ref="usuarioListRef" @edit="handleEdit" />

    <UsuarioSave :mostrar="mostrarDialog" :usuario="usuarioEdit" :modoEdicion="!!usuarioEdit" @guardar="handleGuardar"
      @close="handleCloseDialog" />
  </div>
</template>
