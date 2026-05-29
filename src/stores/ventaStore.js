import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useVentaStore = defineStore('venta', () => {
  const ventas = ref([])
  const empleados = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchVentas(params = {}) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/ventas', { params })
      ventas.value = Array.isArray(data) ? data : data?.items ?? []
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchVentasHoy() {
    const hoy = new Date().toISOString().split('T')[0]
    const { data } = await api.get('/ventas', { params: { fecha: hoy } })
    return Array.isArray(data) ? data : data?.items ?? []
  }

  async function fetchUltimasVentas(limit = 5) {
    const { data } = await api.get('/ventas', { params: { limit } })
    return Array.isArray(data) ? data.slice(0, limit) : (data?.items ?? []).slice(0, limit)
  }

  async function fetchEmpleados() {
    try {
      const { data } = await api.get('/empleados')
      empleados.value = Array.isArray(data) ? data : data?.items ?? []
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function registrarVenta(payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.post('/ventas', payload)
      await fetchVentas()
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function getResumenDia() {
    try {
      const { data } = await api.get('/ventas/resumen-dia')
      return data
    } catch {
      const ventasHoy = await fetchVentasHoy()
      const total = ventasHoy.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
      return { totalVentas: total, cantidad: ventasHoy.length }
    }
  }

  return {
    ventas,
    empleados,
    loading,
    error,
    fetchVentas,
    fetchVentasHoy,
    fetchUltimasVentas,
    fetchEmpleados,
    registrarVenta,
    getResumenDia,
  }
})
