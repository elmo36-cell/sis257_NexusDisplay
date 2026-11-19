<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useSesionStore } from '@/stores'

const sesion = useSesionStore()
const anio = new Date().getFullYear()

const enlacesCuenta = computed(() => {
  if (!sesion.estaAutenticado) return [{ label: 'Iniciar sesión', to: '/login' }]

  const enlaces = [{ label: 'Mis compras', to: '/ventas' }]
  if (sesion.esAdmin) enlaces.push({ label: 'Administración', to: '/pantallas' })
  return enlaces
})
</script>

<template>
  <footer class="nexus-footer">
    <div class="container">
      <div class="nexus-footer__grid">
        <div>
          <RouterLink to="/" class="nexus-brand mb-2">
            <span class="nexus-brand__mark">N</span>
            <span class="nexus-brand__text">
              Nexus Display
              <small>Pantallas y repuestos</small>
            </span>
          </RouterLink>
          <p class="mt-3 mb-0" style="max-width: 26rem; line-height: 1.7">
            Distribución de pantallas y repuestos para teléfonos móviles. Catálogo por marca, modelo
            y calidad, con inventario por sucursal y ventas registradas en línea.
          </p>
        </div>

        <div>
          <h6>Explorar</h6>
          <RouterLink to="/">Catálogo de pantallas</RouterLink>
          <RouterLink :to="{ path: '/', hash: '#contacto-vendedores' }">
            Contacto de vendedores
          </RouterLink>
          <RouterLink :to="{ path: '/', hash: '#direcciones-almacenes' }">
            Direcciones de almacenes
          </RouterLink>
        </div>

        <div>
          <h6>Mi cuenta</h6>
          <RouterLink v-for="enlace in enlacesCuenta" :key="enlace.to" :to="enlace.to">
            {{ enlace.label }}
          </RouterLink>
        </div>
      </div>

      <div class="nexus-footer__bottom">
        <span>© {{ anio }} Nexus Display · SIS257</span>
        <span>Proyecto académico · Gestión de inventario y ventas</span>
      </div>
    </div>
  </footer>
</template>
