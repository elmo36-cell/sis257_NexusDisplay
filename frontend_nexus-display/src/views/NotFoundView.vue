<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="page-shell">
    <div class="container">
      <div class="surface-card empty-state" style="max-width: 560px; margin: 2rem auto">
        <div class="empty-state__icon"><i class="pi pi-compass"></i></div>
        <h2 class="page-title mb-1">Página no encontrada</h2>
        <p class="mb-4">
          La dirección que abriste no existe o fue movida. Vuelve al catálogo para seguir explorando
          las pantallas disponibles.
        </p>
        <RouterLink to="/" class="btn btn-primary">
          <i class="pi pi-arrow-left me-2"></i>Volver al catálogo
        </RouterLink>
      </div>
    </div>
  </div>
</template>
