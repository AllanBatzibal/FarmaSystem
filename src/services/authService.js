import api from './api'

export const authService = {
  login: (usuario, contrasena) => api.post('/auth/login', { usuario, contrasena }),
  estado: () => api.get('/auth/estado'),
}
