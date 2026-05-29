import api from './api'

export const compraService = {
  getAll: () => api.get('/compras'),
  getById: (id) => api.get(`/compras/${id}`),
  getResumenMes: () => api.get('/compras/resumen-mes'),
  create: (data) => api.post('/compras', data),
}
