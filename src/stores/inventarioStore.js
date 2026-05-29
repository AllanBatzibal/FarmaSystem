import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { getStockStatus } from '@/utils/format'

export const useInventarioStore = defineStore('inventario', () => {
  const inventario = ref([])
  const loading = ref(false)
  const error = ref(null)

  const stockCriticoCount = computed(
    () =>
      inventario.value.filter(
        (item) =>
          getStockStatus(
            item.stockActual ?? item.stock,
            item.stockMinimo ?? item.stockMinimo
          ) === 'critico'
      ).length
  )

  async function fetchInventario() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/inventario')
      inventario.value = Array.isArray(data) ? data : data?.items ?? []
    } catch {
      const { data } = await api.get('/medicamentos')
      const items = Array.isArray(data) ? data : data?.items ?? []
      inventario.value = items.map((m) => ({
        ...m,
        stockActual: m.stockActual ?? m.stock ?? 0,
        stockMinimo: m.stockMinimo ?? m.stockMinimo ?? 0,
      }))
    } finally {
      loading.value = false
    }
  }

  async function getResumenComprasMes() {
    try {
      const { data } = await api.get('/compras/resumen-mes')
      return data
    } catch {
      const inicioMes = new Date()
      inicioMes.setDate(1)
      const { data } = await api.get('/compras', {
        params: { desde: inicioMes.toISOString().split('T')[0] },
      })
      const compras = Array.isArray(data) ? data : data?.items ?? []
      const total = compras.reduce((sum, c) => sum + (Number(c.total) || 0), 0)
      return { totalCompras: total, cantidad: compras.length }
    }
  }

  function filterByStatus(items, filtro) {
    if (filtro === 'todos') return items
    return items.filter((item) => {
      const status = getStockStatus(
        item.stockActual ?? item.stock,
        item.stockMinimo ?? item.stockMinimo
      )
      if (filtro === 'ok') return status === 'ok'
      if (filtro === 'bajo') return status === 'bajo'
      if (filtro === 'critico') return status === 'critico'
      return true
    })
  }

  return {
    inventario,
    loading,
    error,
    stockCriticoCount,
    fetchInventario,
    getResumenComprasMes,
    filterByStatus,
  }
})
