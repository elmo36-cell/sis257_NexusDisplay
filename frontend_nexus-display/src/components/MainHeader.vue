<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Select } from 'primevue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const rutaSeleccionada = ref<string>(route.path)

watch(
  () => route.path,
  (nuevaRuta) => {
    rutaSeleccionada.value = nuevaRuta
  },
)

const modulosPorJerarquia = computed(() => {
  if (authStore.rol === 'ADMIN') {
    return [
      { label: 'Pantallas', value: '/pantallas' },
      { label: 'Inventario por Almacén', value: '/inventario' },
      { label: 'Almacenes y Direcciones', value: '/almacenes' },
      { label: 'Categorías de Repuestos', value: '/categorias' },
      { label: 'Calidades', value: '/calidades' },
      { label: 'Marcas', value: '/marcas' },
      { label: 'Modelos', value: '/modelos' },
      { label: 'Ventas', value: '/ventas' },
      { label: 'Detalles de Venta', value: '/detalles-venta' },
      { label: 'Compras a Proveedores', value: '/compras' },
      { label: 'Detalles de Compra', value: '/detalles-compra' },
      { label: 'Proveedores', value: '/proveedores' },
      { label: 'Usuarios y Roles', value: '/usuarios' },
    ]
  }

  if (authStore.rol === 'VENDEDOR') {
    return [
      { label: 'Ventas', value: '/ventas' },
      { label: 'Detalles de Venta', value: '/detalles-venta' },
      { label: 'Inventario por Almacén', value: '/inventario' },
      { label: 'Direcciones de Almacenes', value: '/almacenes' },
      { label: 'Categorías de Repuestos', value: '/categorias' },
      { label: 'Añadir / Ver Clientes', value: '/usuarios' },
    ]
  }

  return []
})

function irAModulo(ruta: string) {
  if (ruta) {
    router.push(ruta)
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top px-3 py-2"
    style="background-color: #0f172a !important; border-bottom: 3px solid #06b6d4">
    <div class="container-fluid">
      <RouterLink to="/" class="navbar-brand fw-bold">
        <span class="text-info">NEXUS</span> DISPLAY
      </RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNexus">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNexus">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center gap-2">
          <!-- Visible para todos -->
          <li class="nav-item">
            <RouterLink to="/" class="nav-link text-white fw-semibold">
              Catálogo Web
            </RouterLink>
          </li>

          <!-- Para Visitante o CLIENTE: Enlace directo al Contacto del Vendedor -->
          <li v-if="!authStore.token || authStore.rol === 'CLIENTE'" class="nav-item">
            <a href="/#contacto-vendedores" class="nav-link text-white">
              Contacto Vendedor
            </a>
          </li>

          <!-- Para CLIENTE logueado: Solo ve sus propias compras (no puede añadir clientes) -->
          <li v-if="authStore.token && authStore.rol === 'CLIENTE'" class="nav-item">
            <RouterLink to="/ventas" class="nav-link text-white">
              Mis Compras
            </RouterLink>
          </li>

          <!-- Para VENDEDOR y ADMIN -->
          <template v-if="authStore.token && (authStore.rol === 'ADMIN' || authStore.rol === 'VENDEDOR')">
            <li class="nav-item">
              <RouterLink to="/ventas" class="nav-link text-white">
                Ventas
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/inventario" class="nav-link text-white">
                Inventario
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/almacenes" class="nav-link text-white">
                Almacenes
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/categorias" class="nav-link text-white">
                Categorías
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/usuarios" class="nav-link text-info fw-semibold">
                {{ authStore.rol === 'VENDEDOR' ? 'Añadir Clientes' : 'Usuarios' }}
              </RouterLink>
            </li>
          </template>

          <!-- Exclusivo para ADMIN -->
          <template v-if="authStore.token && authStore.rol === 'ADMIN'">
            <li class="nav-item">
              <RouterLink to="/pantallas" class="nav-link text-white">
                Pantallas
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/compras" class="nav-link text-white">
                Compras
              </RouterLink>
            </li>
          </template>

          <!-- SELECT DE NAVEGACIÓN PARA VENDEDOR Y ADMIN -->
          <li v-if="authStore.token && modulosPorJerarquia.length > 0" class="nav-item ms-lg-2">
            <Select v-model="rutaSeleccionada" :options="modulosPorJerarquia" optionLabel="label" optionValue="value"
              :placeholder="`Módulos (${authStore.rol})`" class="w-15rem" @update:modelValue="irAModulo" />
          </li>
        </ul>

        <!-- Sesión activa -->
        <div class="d-flex align-items-center gap-2">
          <template v-if="authStore.token">
            <span class="badge py-2 px-3 fw-bold" :class="{
              'bg-primary text-white': authStore.rol === 'ADMIN',
              'bg-success text-white': authStore.rol === 'VENDEDOR',
              'bg-info text-dark': authStore.rol === 'CLIENTE',
            }">
              {{ authStore.user }} ({{ authStore.rol }})
            </span>
            <button @click="authStore.logout()" class="btn btn-danger btn-sm">
              Salir
            </button>
          </template>
          <RouterLink v-else to="/login" class="btn btn-info btn-sm fw-bold text-dark">
            Iniciar Sesión
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>
