import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },

    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/marcas',
      name: 'marcas',
      component: () => import('../views/MarcasView.vue'),
    },
    {
      path: '/modelos',
      name: 'modelos',
      component: () => import('../views/ModelosView.vue'),
    },
    {
      path: '/calidades',
      name: 'calidades',
      component: () => import('../views/CalidadesView.vue'),
    },
    {
      path: '/categorias',
      name: 'categorias',
      component: () => import('../views/CategoriasView.vue'),
    },
    {
      path: '/pantallas',
      name: 'pantallas',
      component: () => import('../views/PantallasView.vue'),
    },
    {
      path: '/almacenes',
      name: 'almacenes',
      component: () => import('../views/AlmacenesView.vue'),
    },
    {
      path: '/inventario-almacen',
      name: 'inventario-almacen',
      component: () => import('../views/InventarioAlmacenView.vue'),
    },
    {
      path: '/proveedores',
      name: 'proveedores',
      component: () => import('../views/ProveedoresView.vue'),
    },
    {
      path: '/compras',
      name: 'compras',
      component: () => import('../views/ComprasView.vue'),
    },
    {
      path: '/detalles-compra',
      name: 'detalles-compra',
      component: () => import('../views/DetallesCompraView.vue'),
    },
    {
      path: '/ventas',
      name: 'ventas',
      component: () => import('../views/VentasView.vue'),
    },
    {
      path: '/detalles-venta',
      name: 'detalles-venta',
      component: () => import('../views/DetallesVentaView.vue'),
    },
    {
      path: '/roles',
      name: 'roles',
      component: () => import('../views/RolesView.vue'),
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('../views/UsuariosView.vue'),
    },
  ],
})

export default router
