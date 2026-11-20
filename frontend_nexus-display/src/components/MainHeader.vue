<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import Menu from 'primevue/menu'
import { useSesionStore } from '@/stores'
import { useCarritoStore } from '@/stores/carrito'
import { notify } from '@/helpers/notificaciones'

const sesion = useSesionStore()
const carrito = useCarritoStore()
const route = useRoute()
const router = useRouter()

const navAbierto = ref(false)
const menuAdminAbierto = ref(false)
const adminMenuRef = ref<InstanceType<typeof Menu> | null>(null)

interface EnlaceNav {
  label: string
  to: string
  icon: string
}

const enlaces = computed<EnlaceNav[]>(() => {
  const base: EnlaceNav[] = [{ label: 'Catálogo', to: '/', icon: 'pi pi-th-large' }]

  if (!sesion.estaAutenticado) {
    return [...base, { label: 'Contacto', to: '/#contacto-vendedores', icon: 'pi pi-comments' }]
  }

  if (sesion.esCliente) {
    return [
      ...base,
      { label: 'Mis compras', to: '/ventas', icon: 'pi pi-shopping-bag' },
      { label: 'Contacto', to: '/#contacto-vendedores', icon: 'pi pi-comments' },
    ]
  }

  return [
    ...base,
    { label: 'Ventas', to: '/ventas', icon: 'pi pi-shopping-cart' },
    { label: 'Inventario', to: '/inventario', icon: 'pi pi-box' },
    { label: 'Almacenes', to: '/almacenes', icon: 'pi pi-building' },
    { label: 'Categorías', to: '/categorias', icon: 'pi pi-tags' },
    { label: sesion.esAdmin ? 'Usuarios' : 'Clientes', to: '/usuarios', icon: 'pi pi-users' },
  ]
})

const enlacesAdmin = computed<EnlaceNav[]>(() =>
  sesion.esAdmin
    ? [
      { label: 'Pantallas', to: '/pantallas', icon: 'pi pi-mobile' },
      { label: 'Marcas', to: '/marcas', icon: 'pi pi-bookmark' },
      { label: 'Modelos', to: '/modelos', icon: 'pi pi-list' },
      { label: 'Calidades', to: '/calidades', icon: 'pi pi-star' },
      { label: 'Proveedores', to: '/proveedores', icon: 'pi pi-truck' },
      { label: 'Compras', to: '/compras', icon: 'pi pi-download' },
      { label: 'Detalles de compra', to: '/detalles-compra', icon: 'pi pi-file' },
      { label: 'Detalles de venta', to: '/detalles-venta', icon: 'pi pi-receipt' },
    ]
    : [],
)

const adminItems = computed(() =>
  enlacesAdmin.value.map((enlace) => ({
    label: enlace.label,
    icon: enlace.icon,
    command: () => router.push(enlace.to),
  })),
)

const claseRol = computed(() => {
  if (sesion.rol === 'ADMIN') return 'nexus-role--admin'
  if (sesion.rol === 'VENDEDOR') return 'nexus-role--vendedor'
  return ''
})

function rutaBase(ruta: string) {
  return ruta.split('#')[0] || '/'
}

function esActiva(ruta: string) {
  return route.path === rutaBase(ruta)
}

function irA(ruta: string) {
  navAbierto.value = false
  router.push(ruta)
}

function toggleAdmin(evento: Event) {
  adminMenuRef.value?.toggle(evento)
}

function cerrarSesion() {
  navAbierto.value = false
  sesion.cerrarSesion()
  notify.info('Sesión finalizada correctamente')
  router.push({ name: 'login' })
}

watch(
  () => route.fullPath,
  () => {
    navAbierto.value = false
    adminMenuRef.value?.hide?.()
  },
)
</script>

<template>
  <header class="nexus-nav">
    <div class="container">
      <div class="nexus-nav__inner">
        <RouterLink to="/" class="nexus-brand">
          <span class="nexus-brand__mark">N</span>
          <span class="nexus-brand__text">
            Nexus Display
            <small>Pantallas y repuestos</small>
          </span>
        </RouterLink>

        <nav class="d-none d-lg-flex align-articulos-center" aria-label="Navegación principal">
          <ul class="nexus-links">
            <li v-for="enlace in enlaces" :key="enlace.to">
              <RouterLink :to="enlace.to" class="nexus-link" :class="{ 'is-active': esActiva(enlace.to) }">
                <i :class="enlace.icon"></i>
                <span>{{ enlace.label }}</span>
              </RouterLink>
            </li>
            <li v-if="sesion.esAdmin">
              <button type="button" class="nexus-link" :class="{ 'is-active': menuAdminAbierto }" aria-haspopup="true"
                @click="toggleAdmin">
                <i class="pi pi-cog"></i>
                <span>Administración</span>
                <i class="pi pi-angle-down" style="font-size: 0.65rem"></i>
              </button>
            </li>
          </ul>
        </nav>

        <div class="ms-auto d-flex align-articulos-center gap-2">
          <button type="button" class="nexus-carrito" aria-label="Abrir carrito de compras" @click="carrito.abrir()">
            <i class="pi pi-shopping-cart"></i>
            <span v-if="carrito.unidades" class="nexus-cart__badge">{{ carrito.unidades }}</span>
          </button>

          <div v-if="sesion.estaAutenticado" class="nexus-user d-none d-sm-inline-flex">
            <span class="nexus-user__name">{{ sesion.usuario }}</span>
            <span class="nexus-role" :class="claseRol">{{ sesion.rol }}</span>
            <button type="button" class="nexus-icon-btn" style="width: 32px; height: 32px" title="Cerrar sesión"
              aria-label="Cerrar sesión" @click="cerrarSesion">
              <i class="pi pi-sign-out" style="font-size: 0.8rem"></i>
            </button>
          </div>

          <RouterLink v-else to="/login"
            class="btn btn-info btn-sm fw-bold d-none d-sm-inline-flex align-articulos-center gap-2">
            <i class="pi pi-user"></i>
            <span>Iniciar sesión</span>
          </RouterLink>

          <button type="button" class="nexus-icon-btn d-lg-none" :aria-expanded="navAbierto"
            aria-label="Abrir menú de navegación" @click="navAbierto = !navAbierto">
            <i :class="navAbierto ? 'pi pi-times' : 'pi pi-bars'"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="navAbierto" class="nexus-mobile-panel d-lg-none">
      <div class="container d-flex flex-column gap-1">
        <button v-for="enlace in enlaces" :key="`m-${enlace.to}`" type="button" class="nexus-link"
          :class="{ 'is-active': esActiva(enlace.to) }" @click="irA(enlace.to)">
          <i :class="enlace.icon"></i>
          <span>{{ enlace.label }}</span>
        </button>

        <template v-if="enlacesAdmin.length">
          <div class="section-label mt-3 mb-1 px-1" style="color: #94a3b8">Administración</div>
          <button v-for="enlace in enlacesAdmin" :key="`m-${enlace.label}`" type="button" class="nexus-link"
            :class="{ 'is-active': esActiva(enlace.to) }" @click="irA(enlace.to)">
            <i :class="enlace.icon"></i>
            <span>{{ enlace.label }}</span>
          </button>
        </template>

        <button type="button" class="nexus-link mt-1" @click="carrito.abrir(); navAbierto = false">
          <i class="pi pi-shopping-cart"></i>
          <span>Carrito ({{ carrito.unidades }})</span>
        </button>

        <div class="d-flex align-articulos-center gap-2 border-top mt-3 pt-3"
          style="border-color: rgba(148,163,184,.2) !important">
          <template v-if="sesion.estaAutenticado">
            <span class="nexus-user__name">{{ sesion.usuario }}</span>
            <span class="nexus-role" :class="claseRol">{{ sesion.rol }}</span>
            <button type="button" class="btn btn-outline-light btn-sm ms-auto" @click="cerrarSesion">
              Salir
            </button>
          </template>
          <button v-else type="button" class="btn btn-info btn-sm fw-bold w-100" @click="irA('/login')">
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
    <!-- El menú se dibuja en el body, pero la cabecera fija tiene z-index 1030:
         subo el z-index del desplegable para que su primera opción no quede
         tapada por la cabecera. -->
    <Menu ref="adminMenuRef" :model="adminItems" popup :base-z-index="1100" @show="menuAdminAbierto = true"
      @hide="menuAdminAbierto = false" />
  </header>
</template>
