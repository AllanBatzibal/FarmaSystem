import api from './api'

export const inventarioService = {
  getAll: () => api.get('/inventario'),
  getMovimientos: () => api.get('/inventario/movimientos'),
  getMovimientosPorMedicamento: (idMedicamento) =>
    api.get(`/inventario/movimientos/${idMedicamento}`),
}
