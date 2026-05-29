<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const pageTitle = computed(() => route.meta.title || 'FarmaSystem')

function logout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
    <div class="flex h-14 items-center justify-between px-6">
      <div class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-lg font-bold text-white"
        >
          F
        </div>
        <div>
          <h1 class="text-lg font-semibold text-slate-800">FarmaSystem</h1>
          <p class="text-xs text-slate-500">{{ pageTitle }}</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="text-right text-sm">
          <p class="font-medium text-slate-800">{{ authStore.nombreCompleto }}</p>
          <p class="text-xs text-primary-600">{{ authStore.rol }}</p>
        </div>
        <button type="button" class="btn-secondary text-xs" @click="logout">
          Cerrar sesión
        </button>
      </div>
    </div>
  </header>
</template>
