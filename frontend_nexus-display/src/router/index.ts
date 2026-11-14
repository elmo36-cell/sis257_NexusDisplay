import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '@/stores'
import { getTokenFromLocalStorage } from '@/helpers'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/ventas',
      name: 'ventas',
      component: () => import('../views/VentasView.vue'),
      meta: { roles: ['ADMIN', 'VENDEDOR', 'CLIENTE'] },
    },
    {
      path: '/detalles-venta',
      name: 'detalles-venta',
      component: () => import('../views/DetallesVentaView.vue'),
      meta: { roles: ['ADMIN', 'VENDEDOR'] },
    },
    {
      path: '/inventario',
      name: 'inventario',
      component: () => import('../views/InventarioAlmacenView.vue'),
      meta: { roles: ['ADMIN', 'VENDEDOR'] },
    },
    {
      path: '/almacenes',
      name: 'almacenes',
      component: () => import('../views/AlmacenesView.vue'),
      meta: { roles: ['ADMIN', 'VENDEDOR'] },
    },
    {
      path: '/categorias',
      name: 'categorias',
      component: () => import('../views/CategoriasView.vue'),
      meta: { roles: ['ADMIN', 'VENDEDOR'] },
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('../views/UsuariosView.vue'),
      meta: { roles: ['ADMIN', 'VENDEDOR'] },
    },
    {
      path: '/pantallas',
      name: 'pantallas',
      component: () => import('../views/PantallasView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/marcas',
      name: 'marcas',
      component: () => import('../views/MarcasView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/modelos',
      name: 'modelos',
      component: () => import('../views/ModelosView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/calidades',
      name: 'calidades',
      component: () => import('../views/CalidadesView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/proveedores',
      name: 'proveedores',
      component: () => import('../views/ProveedoresView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/compras',
      name: 'compras',
      component: () => import('../views/ComprasView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/detalles-compra',
      name: 'detalles-compra',
      component: () => import('../views/DetallesCompraView.vue'),
      meta: { roles: ['ADMIN'] },
    },
  ],
})

router.beforeEach(async (to) => {
  const publicPages = ['/', '/login']
  const authRequired = !publicPages.includes(to.path)
  const authStore = useAuthStore()

  if (authRequired && !getTokenFromLocalStorage()) {
    if (authStore) authStore.logout()
    authStore.returnUrl = to.fullPath
    return '/login'
  }

  const allowedRoles = to.meta?.roles as string[] | undefined
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(authStore.rol)) {
    return '/'
  }
})

export default router
