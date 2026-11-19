import { createRouter, createWebHistory } from 'vue-router'
import { rutaInicialPorRol, useSesionStore } from '@/stores'
import { obtenerTokenDeSesion } from '@/helpers'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, top: 84, behavior: 'smooth' }
    }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { publico: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { publico: true },
    },
    {
      path: '/registro',
      name: 'registro',
      component: () => import('@/views/RegistroView.vue'),
      meta: { publico: true },
    },
    {
      path: '/ventas',
      name: 'ventas',
      component: () => import('@/views/VentasView.vue'),
      meta: { roles: ['ADMIN', 'VENDEDOR', 'CLIENTE'] },
    },
    {
      path: '/detalles-venta',
      name: 'detalles-venta',
      component: () => import('@/views/DetallesVentaView.vue'),
      meta: { roles: ['ADMIN', 'VENDEDOR'] },
    },
    {
      path: '/inventario',
      name: 'inventario',
      component: () => import('@/views/InventarioAlmacenView.vue'),
      meta: { roles: ['ADMIN', 'VENDEDOR'] },
    },
    {
      path: '/almacenes',
      name: 'almacenes',
      component: () => import('@/views/AlmacenesView.vue'),
      meta: { roles: ['ADMIN', 'VENDEDOR'] },
    },
    {
      path: '/categorias',
      name: 'categorias',
      component: () => import('@/views/CategoriasView.vue'),
      meta: { roles: ['ADMIN', 'VENDEDOR'] },
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('@/views/UsuariosView.vue'),
      meta: { roles: ['ADMIN', 'VENDEDOR'] },
    },
    {
      path: '/pantallas',
      name: 'pantallas',
      component: () => import('@/views/PantallasView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/marcas',
      name: 'marcas',
      component: () => import('@/views/MarcasView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/modelos',
      name: 'modelos',
      component: () => import('@/views/ModelosView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/calidades',
      name: 'calidades',
      component: () => import('@/views/CalidadesView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/proveedores',
      name: 'proveedores',
      component: () => import('@/views/ProveedoresView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/compras',
      name: 'compras',
      component: () => import('@/views/ComprasView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/detalles-compra',
      name: 'detalles-compra',
      component: () => import('@/views/DetallesCompraView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { publico: true },
    },
  ],
})

/**
 * Control de navegación:
 * - Las rutas públicas (home, login, registro, 404) se pueden ver sin sesión.
 * - Las privadas, si no hay token, mandan a /login y guardo la ruta en
 *   rutaRetorno para volver ahí después de entrar.
 * - Si la ruta pide ciertos roles y el usuario no los tiene, lo mando a su
 *   página de inicio. Igual la seguridad de verdad está en el backend.
 */
router.beforeEach((to) => {
  const sesion = useSesionStore()
  const token = obtenerTokenDeSesion()

  if (!token && sesion.estaAutenticado) {
    sesion.limpiarSesion()
  }

  if (to.meta.publico) {
    if ((to.name === 'login' || to.name === 'registro') && token) {
      return rutaInicialPorRol(sesion.rol)
    }
    return true
  }

  if (!token) {
    sesion.rutaRetorno = to.fullPath
    return { name: 'login' }
  }

  const rolesPermitidos = to.meta.roles as string[] | undefined
  if (rolesPermitidos?.length && !rolesPermitidos.includes(sesion.rol)) {
    return rutaInicialPorRol(sesion.rol)
  }

  return true
})

export default router
