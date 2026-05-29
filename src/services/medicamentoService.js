import api from './api'

export const medicamentoService = {
  getAll: () => api.get('/medicamentos'),
  getById: (id) => api.get(`/medicamentos/${id}`),
  getStockCritico: () => api.get('/medicamentos/stock-critico'),
  getByCategoria: (idCategoria) => api.get(`/medicamentos/categoria/${idCategoria}`),
  create: (data) => api.post('/medicamentos', data),
  update: (id, data) => api.put(`/medicamentos/${id}`, data),
  remove: (id) => api.delete(`/medicamentos/${id}`),
}
