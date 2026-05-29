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
    const isNetwork = !error.response
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('farmasystem_auth')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    const message = isNetwork
      ? `No se pudo conectar con la API (${baseURL}). ¿Está ejecutándose el backend?`
      : error.response?.data?.message ||
        error.response?.data?.error ||
        error.message

    console.error('Error API:', isNetwork ? message : error.response?.data || error.message)
    return Promise.reject(new Error(typeof message === 'string' ? message : 'Error en la solicitud'))
  }
)

export default api
