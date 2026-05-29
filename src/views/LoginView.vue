<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'
import { baseURL } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const usuario = ref('')
const contrasena = ref('')
const error = ref(null)
const loading = ref(false)
const apiStatus = ref({ checking: true, ok: false, db: false, message: '' })

async function verificarApi() {
  apiStatus.value.checking = true
  try {
    const { data } = await authService.estado()
    apiStatus.value = {
      checking: false,
      ok: data.api === 'conectada',
      db: data.baseDatos === 'conectada',
      message: data.baseDatos === 'conectada'
        ? `BD OK · ${data.empleados ?? 0} empleados · ${data.clientes ?? 0} clientes`
        : data.mensaje || 'Error de base de datos',
    }
  } catch (e) {
    apiStatus.value = {
      checking: false,
      ok: false,
      db: false,
      message: e.message,
    }
  }
}

function usarDemo(user) {
  usuario.value = user.usuario
  contrasena.value = user.contrasena
  error.value = null
}

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

onMounted(verificarApi)
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Panel izquierdo -->
    <div
      class="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary-700 via-primary-600 to-emerald-800 p-12 text-white lg:flex"
    >
      <div>
        <div class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur">
          F
        </div>
        <h1 class="text-4xl font-bold leading-tight">FarmaSystem</h1>
        <p class="mt-4 max-w-md text-lg text-primary-100">
          Sistema integral de gestión farmacéutica con control de ventas, inventario y roles de usuario.
        </p>
      </div>

      <div class="space-y-4 text-sm text-primary-100">
        <div class="flex items-center gap-3">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">✓</span>
          Ventas con cliente registrado o nuevo
        </div>
        <div class="flex items-center gap-3">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">✓</span>
          Acceso limitado por rol de empleado
        </div>
        <div class="flex items-center gap-3">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">✓</span>
          Conectado a FarmaSystemDB
        </div>
      </div>
    </div>

    <!-- Panel login -->
    <div class="flex w-full flex-col items-center justify-center p-6 lg:w-1/2">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center lg:text-left">
          <div
            class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-xl font-bold text-white lg:mx-0"
          >
            F
          </div>
          <h2 class="text-2xl font-bold text-slate-900">Iniciar sesión</h2>
          <p class="mt-1 text-sm text-slate-500">Ingrese sus credenciales para continuar</p>
        </div>

        <!-- Estado API / BD -->
        <div
          class="mb-5 rounded-xl border px-4 py-3 text-sm"
          :class="
            apiStatus.checking
              ? 'border-slate-200 bg-slate-50 text-slate-600'
              : apiStatus.ok && apiStatus.db
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-900'
          "
        >
          <p class="font-medium">
            {{
              apiStatus.checking
                ? 'Verificando conexión...'
                : apiStatus.ok && apiStatus.db
                  ? '✓ API y base de datos conectadas'
                  : '⚠ Problema de conexión'
            }}
          </p>
          <p v-if="!apiStatus.checking" class="mt-1 text-xs opacity-80">
            {{ apiStatus.message }} · {{ baseURL }}
          </p>
          <button
            v-if="!apiStatus.checking && (!apiStatus.ok || !apiStatus.db)"
            type="button"
            class="mt-2 text-xs font-semibold underline hover:no-underline"
            @click="verificarApi"
          >
            Reintentar conexión
          </button>
          <p v-if="!apiStatus.checking && !apiStatus.ok" class="mt-2 text-xs">
            Asegúrese de ejecutar: <code class="rounded bg-black/5 px-1">cd FarmaSystem.API && dotnet run</code>
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <div
            v-if="error"
            class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {{ error }}
          </div>

          <div>
            <label class="label-field">Usuario</label>
            <input
              v-model="usuario"
              type="text"
              class="input-field"
              placeholder="Ingrese su usuario"
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

          <button type="submit" class="btn-primary w-full py-3" :disabled="loading || !apiStatus.ok || !apiStatus.db">
            {{ loading ? 'Ingresando...' : 'Entrar al sistema' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
