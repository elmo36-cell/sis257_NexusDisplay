<script setup lang="ts">
import { useNotificaciones } from '@/helpers/notificaciones'

const { notificaciones, descartar } = useNotificaciones()

const iconos: Record<string, string> = {
  success: 'pi pi-check-circle',
  error: 'pi pi-exclamation-circle',
  warn: 'pi pi-exclamation-triangle',
  info: 'pi pi-info-circle',
}
</script>

<template>
  <div class="toast-stack" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div v-for="n in notificaciones" :key="n.id" class="toast-card" :class="`toast-card--${n.tipo}`" role="status">
        <i class="toast-card__icon" :class="iconos[n.tipo]"></i>
        <div class="toast-card__text">{{ n.mensaje }}</div>
        <button type="button" class="toast-card__close" aria-label="Cerrar notificación" @click="descartar(n.id)">
          <i class="pi pi-times"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
