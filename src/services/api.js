import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'http://localhost:5280/api')

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

function buildErrorMessage(error) {
  const url = `${error.config?.baseURL || baseURL}${error.config?.url || ''}`

  if (!error.response) {
    return `No se pudo conectar con la API en ${baseURL}. Inicie el backend: cd FarmaSystem.API && dotnet run`
  }

  const status = error.response.status
  const data = error.response.data

  if (status === 404) {
    return `Endpoint no encontrado (${url}). Reinicie la API con "dotnet run" para cargar la versión actual.`
  }
  if (status === 401) {
    return data?.message || 'Usuario o contraseña incorrectos.'
  }
  if (status === 500) {
    return data?.message || data?.error || 'Error interno del servidor.'
  }

  return data?.message || data?.error || data?.title || error.message || 'Error en la solicitud'
}

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('farmasystem_auth')
    if (raw) {
      const { token } = JSON.parse(raw)
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    /* ignore */
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('farmasystem_auth')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    const message = buildErrorMessage(error)
    console.error('Error API:', message)
    return Promise.reject(new Error(message))
  }
)

export default api
export { baseURL }
