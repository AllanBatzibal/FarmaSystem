import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { puedeAcceder, rutaPorDefecto } from '@/config/roles'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Iniciar sesión', public: true },
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Dashboard', roles: ['Administrador', 'Inventario'] },
  },
  {
    path: '/clientes',
    name: 'clientes',
    component: () => import('@/views/ClientesView.vue'),
    meta: { title: 'Clientes', roles: ['Administrador', 'Vendedor'] },
  },
  {
    path: '/proveedores',
    name: 'proveedores',
    component: () => import('@/views/ProveedoresView.vue'),
    meta: { title: 'Proveedores', roles: ['Administrador', 'Inventario'] },
  },
  {
    path: '/empleados',
    name: 'empleados',
    component: () => import('@/views/EmpleadosView.vue'),
    meta: { title: 'Empleados', roles: ['Administrador'] },
  },
  {
    path: '/medicamentos',
    name: 'medicamentos',
    component: () => import('@/views/MedicamentosView.vue'),
    meta: { title: 'Medicamentos', roles: ['Administrador', 'Vendedor', 'Inventario'] },
  },
  {
    path: '/inventario',
    name: 'inventario',
    component: () => import('@/views/InventarioView.vue'),
    meta: { title: 'Inventario', roles: ['Administrador', 'Inventario'] },
  },
  {
    path: '/ventas',
    name: 'ventas',
    component: () => import('@/views/VentasView.vue'),
    meta: { title: 'Ventas', roles: ['Administrador', 'Vendedor'] },
  },
  {
    path: '/compras',
    name: 'compras',
    component: () => import('@/views/ComprasView.vue'),
    meta: { title: 'Compras', roles: ['Administrador', 'Inventario'] },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.public) {
    if (authStore.isAuthenticated && to.name === 'login') {
      return next({ name: rutaPorDefecto(authStore.rol) })
    }
    return next()
  }

  if (!authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (!puedeAcceder(authStore.rol, to.name)) {
    return next({ name: rutaPorDefecto(authStore.rol) })
  }

  next()
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'FarmaSystem'} | FarmaSystem`
})

export default router
