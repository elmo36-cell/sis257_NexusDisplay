<script setup lang="ts">
import { RouterView } from 'vue-router'
import MainHeader from '@/components/MainHeader.vue'
import MainFooter from '@/components/MainFooter.vue'
</script>

<template>
  <div class="d-flex flex-column min-vh-100 w-100 bg-light text-dark">
    <MainHeader />
    <main class="flex-grow-1 w-100">
      <RouterView />
    </main>
    <MainFooter />
  </div>
</template>

<style>
html,
body,
#app {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  background-color: #f8fafc !important;
}
</style>
