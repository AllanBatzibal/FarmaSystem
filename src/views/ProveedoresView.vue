<script setup>
import { ref, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import ModalForm from '@/components/ModalForm.vue'
import api from '@/services/api'

const proveedores = ref([])
const loading = ref(false)
const error = ref(null)
const showModal = ref(false)
const editingId = ref(null)
const formError = ref(null)
const currentPage = ref(1)

const form = ref({
  nombre: '',
  contacto: '',
  telefono: '',
  email: '',
  direccion: '',
})

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre / Razón social' },
  { key: 'contacto', label: 'Contacto' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'email', label: 'Email' },
  { key: 'acciones', label: 'Acciones' },
]

async function fetchProveedores() {
  loading.value = true
  error.value = null
  try {
    const { data } = await api.get('/proveedores')
    proveedores.value = Array.isArray(data) ? data : data?.items ?? []
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = { nombre: '', contacto: '', telefono: '', email: '', direccion: '' }
  formError.value = null
  editingId.value = null
}

function openCreate() {
  resetForm()
  showModal.value = true
}

function openEdit(row) {
  editingId.value = row.id
  form.value = {
    nombre: row.nombre || row.razonSocial || '',
    contacto: row.contacto || '',
    telefono: row.telefono || '',
    email: row.email || '',
    direccion: row.direccion || '',
  }
  showModal.value = true
}

function validate() {
  if (!form.value.nombre?.trim()) {
    formError.value = 'El nombre es obligatorio.'
    return false
  }
  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    formError.value = 'Ingrese un correo válido.'
    return false
  }
  formError.value = null
  return true
}

async function submitForm() {
  if (!validate()) return
  loading.value = true
  try {
    if (editingId.value) {
      await api.put(`/proveedores/${editingId.value}`, { ...form.value })
    } else {
      await api.post('/proveedores', { ...form.value })
    }
    showModal.value = false
    resetForm()
    await fetchProveedores()
  } catch (e) {
    formError.value = e.message
  } finally {
    loading.value = false
  }
}

async function confirmDelete(row) {
  if (!window.confirm(`¿Eliminar proveedor "${row.nombre || row.razonSocial}"?`)) return
  loading.value = true
  try {
    await api.delete(`/proveedores/${row.id}`)
    await fetchProveedores()
  } catch (e) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}

onMounted(fetchProveedores)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Proveedores</h2>
        <p class="text-sm text-slate-500">Gestión de proveedores</p>
      </div>
      <button type="button" class="btn-primary" @click="openCreate">+ Nuevo proveedor</button>
    </div>

    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <DataTable
      v-model:current-page="currentPage"
      :columns="columns"
      :rows="proveedores"
      :loading="loading"
    >
      <template #cell-nombre="{ row }">
        {{ row.nombre || row.razonSocial }}
      </template>
      <template #cell-acciones="{ row }">
        <div class="flex gap-2">
          <button type="button" class="text-sm text-primary-600 hover:underline" @click="openEdit(row)">
            Editar
          </button>
          <button type="button" class="text-sm text-red-600 hover:underline" @click="confirmDelete(row)">
            Eliminar
          </button>
        </div>
      </template>
    </DataTable>

    <ModalForm
      :show="showModal"
      :title="editingId ? 'Editar proveedor' : 'Nuevo proveedor'"
      :loading="loading"
      @close="showModal = false"
      @submit="submitForm"
    >
      <div
        v-if="formError"
        class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
      >
        {{ formError }}
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label class="label-field">Nombre / Razón social *</label>
          <input v-model="form.nombre" type="text" class="input-field" />
        </div>
        <div>
          <label class="label-field">Contacto</label>
          <input v-model="form.contacto" type="text" class="input-field" />
        </div>
        <div>
          <label class="label-field">Teléfono</label>
          <input v-model="form.telefono" type="tel" class="input-field" />
        </div>
        <div>
          <label class="label-field">Email</label>
          <input v-model="form.email" type="email" class="input-field" />
        </div>
        <div class="sm:col-span-2">
          <label class="label-field">Dirección</label>
          <input v-model="form.direccion" type="text" class="input-field" />
        </div>
      </div>
    </ModalForm>
  </div>
</template>
