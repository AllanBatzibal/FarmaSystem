<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const pageTitle = computed(() => route.meta.title || 'FarmaSystem')

const rolBadgeClass = computed(() => {
  const map = {
    Administrador: 'badge-info',
    Vendedor: 'badge-success',
    Inventario: 'badge-warning',
  }
  return map[authStore.rol] || 'badge-info'
})

function logout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
    <div class="flex h-16 items-center justify-between px-6">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-lg font-bold text-white shadow-sm"
        >
          F
        </div>
        <div>
          <h1 class="text-lg font-bold text-slate-900">FarmaSystem</h1>
          <p class="text-xs text-slate-500">{{ pageTitle }}</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="hidden text-right sm:block">
          <p class="text-sm font-semibold text-slate-800">{{ authStore.nombreCompleto }}</p>
          <span class="badge mt-0.5" :class="rolBadgeClass">{{ authStore.rol }}</span>
        </div>
        <button type="button" class="btn-secondary text-xs" @click="logout">
          Salir
        </button>
      </div>
    </div>
  </header>
</template>
