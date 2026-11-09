<script setup lang="ts">
import MainHeader from '@/components/MainHeader.vue'
import MainFooter from '@/components/MainFooter.vue'
</script>

<template>
  <div id="app" class="d-flex flex-column min-vh-0 bg-light">
    <!-- Barra de Navegación Superior -->
    <MainHeader />

    <!-- Contenedor Principal donde se cargan dinámicamente las vistas (Marcas, Roles, Pantallas, etc.) -->
    <main class="flex-grow-1 pt-5 mt-4">
      <RouterView />
    </main>

    <!-- Pie de Página -->
    <MainFooter />
  </div>
</template>

<style>
/* Estilos globales limpios para asegurar que la app ocupe toda la pantalla correctamente */
html,
body {
  height: 100%;
  margin: 0;
  background-color: #588fc7;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
