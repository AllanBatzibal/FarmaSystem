import api from './api'

export const ventaService = {
  getAll: (params) => api.get('/ventas', { params }),
  getById: (id) => api.get(`/ventas/${id}`),
  getHoy: () => api.get('/ventas/hoy'),
  getPorFecha: (inicio, fin) => api.get('/ventas/por-fecha', { params: { inicio, fin } }),
  getResumenDia: () => api.get('/ventas/resumen-dia'),
  create: (data) => api.post('/ventas', data),
}
