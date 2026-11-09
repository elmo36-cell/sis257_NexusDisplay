<script setup lang="ts">
import { useAuthStore } from '@/stores';
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

const menuOpen = ref(false);

function cerrarMenu() {
  menuOpen.value = false;
}

function manejarSesion() {
  menuOpen.value = false;
  if (authStore.token) {
    authStore.logout();
    router.push('/login');
  } else {
    router.push('/login');
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow">
    <div class="container-fluid px-4">
      <RouterLink to="/pantallas" class="navbar-brand fw-bold d-flex align-items-center gap-2" @click="cerrarMenu">
        <i class="fa fa-cube text-success"></i> Omnicell
      </RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown"
        aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation"
        @click="menuOpen = !menuOpen">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" :class="{ show: menuOpen }" id="navbarNavDropdown">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">

          <!-- Catálogo -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Catálogo</a>
            <ul class="dropdown-menu dropdown-menu-dark shadow">
              <li>
                <RouterLink to="/pantallas" class="dropdown-item" @click="cerrarMenu">Pantallas</RouterLink>
              </li>
              <li>
                <RouterLink to="/marcas" class="dropdown-item" @click="cerrarMenu">Marcas</RouterLink>
              </li>
              <li>
                <RouterLink to="/modelos" class="dropdown-item" @click="cerrarMenu">Modelos</RouterLink>
              </li>
              <li>
                <RouterLink to="/categorias" class="dropdown-item" @click="cerrarMenu">Categorías</RouterLink>
              </li>
              <li>
                <RouterLink to="/calidades" class="dropdown-item" @click="cerrarMenu">Calidades</RouterLink>
              </li>
            </ul>
          </li>

          <!-- Logística -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Logística</a>
            <ul class="dropdown-menu dropdown-menu-dark shadow">
              <li>
                <RouterLink to="/almacenes" class="dropdown-item" @click="cerrarMenu">Almacenes</RouterLink>
              </li>
              <li>
                <RouterLink to="/inventario-almacen" class="dropdown-item" @click="cerrarMenu">Inv. Almacén</RouterLink>
              </li>
              <li>
                <RouterLink to="/proveedores" class="dropdown-item" @click="cerrarMenu">Proveedores</RouterLink>
              </li>
            </ul>
          </li>

          <!-- Operaciones -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Operaciones</a>
            <ul class="dropdown-menu dropdown-menu-dark shadow">
              <li>
                <RouterLink to="/compras" class="dropdown-item" @click="cerrarMenu">Compras</RouterLink>
              </li>
              <li>
                <RouterLink to="/detalles-compra" class="dropdown-item" @click="cerrarMenu">Detalles de Compra
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/ventas" class="dropdown-item" @click="cerrarMenu">Ventas</RouterLink>
              </li>
              <li>
                <RouterLink to="/detalles-venta" class="dropdown-item" @click="cerrarMenu">Detalles de Venta
                </RouterLink>
              </li>
            </ul>
          </li>

          <!-- Administración -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Administración</a>
            <ul class="dropdown-menu dropdown-menu-dark shadow">
              <li>
                <RouterLink to="/usuarios" class="dropdown-item" @click="cerrarMenu">Usuarios</RouterLink>
              </li>
              <li>
                <RouterLink to="/roles" class="dropdown-item" @click="cerrarMenu">Roles</RouterLink>
              </li>
            </ul>
          </li>

        </ul>

        <!-- Botón de Sesión -->
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <button class="btn btn-outline-light btn-sm px-3 rounded-pill" @click.prevent="manejarSesion">
              <i class="fa fa-power-off me-1"></i> {{ authStore.token ? 'Cerrar Sesión' : 'Iniciar Sesión' }}
            </button>
          </li>
        </ul>

      </div>
    </div>
  </nav>
</template>
