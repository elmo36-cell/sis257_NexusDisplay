<script setup lang="ts">
import { RouterView } from 'vue-router'
import MainHeader from '@/components/MainHeader.vue'
import MainFooter from '@/components/MainFooter.vue'
import NotificacionesToasts from '@/components/NotificacionesToasts.vue'
import CarritoDrawer from '@/components/CarritoDrawer.vue'
</script>

<template>
  <div class="app-shell">
    <MainHeader />

    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="app-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <MainFooter />
    <CarritoDrawer />
    <NotificacionesToasts />
  </div>
</template>
