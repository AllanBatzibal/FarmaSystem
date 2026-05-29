import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useClienteStore = defineStore('cliente', () => {
  const clientes = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchClientes() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/clientes')
      clientes.value = Array.isArray(data) ? data : data?.items ?? []
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createCliente(payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.post('/clientes', payload)
      await fetchClientes()
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateCliente(id, payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.put(`/clientes/${id}`, payload)
      await fetchClientes()
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteCliente(id) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/clientes/${id}`)
      await fetchClientes()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    clientes,
    loading,
    error,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  }
})
