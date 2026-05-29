<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { RUTAS_POR_ROL } from '@/config/roles'

const route = useRoute()
const authStore = useAuthStore()

const allLinks = [
  { to: '/ventas', name: 'ventas', label: 'Ventas', icon: '🛒' },
  { to: '/', name: 'dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/clientes', name: 'clientes', label: 'Clientes', icon: '👥' },
  { to: '/medicamentos', name: 'medicamentos', label: 'Medicamentos', icon: '💊' },
  { to: '/inventario', name: 'inventario', label: 'Inventario', icon: '📦' },
  { to: '/compras', name: 'compras', label: 'Compras', icon: '📥' },
  { to: '/proveedores', name: 'proveedores', label: 'Proveedores', icon: '🏭' },
  { to: '/empleados', name: 'empleados', label: 'Empleados', icon: '🧑‍💼' },
]

const links = computed(() => {
  const permitidas = RUTAS_POR_ROL[authStore.rol] || []
  return allLinks.filter((l) => permitidas.includes(l.name))
})

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="sticky top-16 h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-slate-200/80 bg-white">
    <div class="border-b border-slate-100 px-4 py-4">
      <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Menú</p>
      <p class="mt-1 text-sm font-medium text-primary-700">{{ authStore.rol }}</p>
    </div>
    <nav class="flex flex-col gap-1 p-3">
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
        :class="
          isActive(link.to)
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        "
      >
        <span class="text-base">{{ link.icon }}</span>
        {{ link.label }}
      </router-link>
    </nav>
  </aside>
</template>
