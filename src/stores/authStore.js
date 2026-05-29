import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { puedeAcceder, rutaPorDefecto } from '@/config/roles'

const STORAGE_KEY = 'farmasystem_auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      token.value = data.token
      user.value = data.user
    } catch {
      logout()
    }
  }

  function saveToStorage() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: token.value, user: user.value })
    )
  }

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const rol = computed(() => user.value?.rol || '')
  const nombreCompleto = computed(
    () => user.value?.nombreCompleto || `${user.value?.nombre || ''} ${user.value?.apellido || ''}`.trim()
  )

  async function login(usuario, contrasena) {
    const { data } = await api.post('/auth/login', { usuario, contrasena })
    token.value = data.token
    user.value = {
      idEmpleado: data.idEmpleado,
      nombre: data.nombre,
      apellido: data.apellido,
      nombreCompleto: data.nombreCompleto,
      rol: data.rol,
      cargo: data.cargo,
    }
    saveToStorage()
    return data
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  function tieneAcceso(routeName) {
    return puedeAcceder(rol.value, routeName)
  }

  function getRutaInicio() {
    return rutaPorDefecto()
  }

  loadFromStorage()

  return {
    token,
    user,
    isAuthenticated,
    rol,
    nombreCompleto,
    login,
    logout,
    tieneAcceso,
    getRutaInicio,
    loadFromStorage,
  }
})
