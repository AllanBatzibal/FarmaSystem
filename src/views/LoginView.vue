<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const usuario = ref('')
const contrasena = ref('')
const error = ref(null)
const loading = ref(false)

async function onSubmit() {
  error.value = null
  loading.value = true
  try {
    await authStore.login(usuario.value.trim(), contrasena.value)
    router.push({ name: authStore.getRutaInicio() })
  } catch (e) {
    error.value = e.message || 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 p-4">
    <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600 text-2xl font-bold text-white"
        >
          F
        </div>
        <h1 class="text-2xl font-bold text-slate-800">FarmaSystem</h1>
        <p class="mt-1 text-sm text-slate-500">Inicie sesión para continuar</p>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div
          v-if="error"
          class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {{ error }}
        </div>

        <div>
          <label class="label-field">Usuario</label>
          <input
            v-model="usuario"
            type="text"
            class="input-field"
            placeholder="admin, vendedor, inventario..."
            required
            autocomplete="username"
          />
        </div>

        <div>
          <label class="label-field">Contraseña</label>
          <input
            v-model="contrasena"
            type="password"
            class="input-field"
            required
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="btn-primary w-full" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>

      <div class="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
        <p class="font-medium text-slate-700">Usuarios de prueba:</p>
        <p>admin / admin123 → Administrador</p>
        <p>vendedor / vendedor123 → Vendedor</p>
        <p>inventario / inventario123 → Inventario</p>
      </div>
    </div>
  </div>
</template>
