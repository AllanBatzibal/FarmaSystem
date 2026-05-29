import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { getStockStatus } from '@/utils/format'

export const useMedicamentoStore = defineStore('medicamento', () => {
  const medicamentos = ref([])
  const categorias = ref([])
  const loading = ref(false)
  const error = ref(null)

  const medicamentosCriticos = computed(() =>
    medicamentos.value.filter(
      (m) => getStockStatus(m.stockActual ?? m.stock, m.stockMinimo ?? m.stockMinimo) === 'critico'
    )
  )

  async function fetchMedicamentos() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/medicamentos')
      medicamentos.value = Array.isArray(data) ? data : data?.items ?? []
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchCategorias() {
    try {
      const { data } = await api.get('/categorias')
      categorias.value = Array.isArray(data) ? data : data?.items ?? []
    } catch {
      const unique = [...new Set(medicamentos.value.map((m) => m.categoria).filter(Boolean))]
      categorias.value = unique.map((nombre, i) => ({ id: i + 1, nombre }))
    }
  }

  async function createMedicamento(payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.post('/medicamentos', payload)
      await fetchMedicamentos()
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateMedicamento(id, payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.put(`/medicamentos/${id}`, payload)
      await fetchMedicamentos()
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteMedicamento(id) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/medicamentos/${id}`)
      await fetchMedicamentos()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    medicamentos,
    categorias,
    loading,
    error,
    medicamentosCriticos,
    fetchMedicamentos,
    fetchCategorias,
    createMedicamento,
    updateMedicamento,
    deleteMedicamento,
  }
})
