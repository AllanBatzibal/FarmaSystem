import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useProveedorStore = defineStore('proveedor', () => {
  const proveedores = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchProveedores() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/proveedores')
      proveedores.value = Array.isArray(data) ? data : data?.items ?? []
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createProveedor(payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.post('/proveedores', payload)
      await fetchProveedores()
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateProveedor(id, payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.put(`/proveedores/${id}`, payload)
      await fetchProveedores()
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteProveedor(id) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/proveedores/${id}`)
      await fetchProveedores()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    proveedores,
    loading,
    error,
    fetchProveedores,
    createProveedor,
    updateProveedor,
    deleteProveedor,
  }
})
