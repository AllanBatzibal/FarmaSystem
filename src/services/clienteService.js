import api from './api'

export const clienteService = {
  getAll: () => api.get('/clientes'),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  remove: (id) => api.delete(`/clientes/${id}`),
  testConexion: () => api.get('/clientes/test-conexion'),
}
