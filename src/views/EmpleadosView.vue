<script setup>
import { ref, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import ModalForm from '@/components/ModalForm.vue'
import api from '@/services/api'

const empleados = ref([])
const loading = ref(false)
const error = ref(null)
const showModal = ref(false)
const editingId = ref(null)
const formError = ref(null)
const currentPage = ref(1)

const form = ref({
  nombre: '',
  apellido: '',
  puesto: '',
  telefono: '',
  email: '',
  salario: '',
})

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'apellido', label: 'Apellido' },
  { key: 'puesto', label: 'Puesto' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'acciones', label: 'Acciones' },
]

async function fetchEmpleados() {
  loading.value = true
  error.value = null
  try {
    const { data } = await api.get('/empleados')
    empleados.value = Array.isArray(data) ? data : data?.items ?? []
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    nombre: '',
    apellido: '',
    puesto: '',
    telefono: '',
    email: '',
    salario: '',
  }
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
    nombre: row.nombre || '',
    apellido: row.apellido || '',
    puesto: row.puesto || '',
    telefono: row.telefono || '',
    email: row.email || '',
    salario: row.salario ?? '',
  }
  showModal.value = true
}

function validate() {
  if (!form.value.nombre?.trim()) {
    formError.value = 'El nombre es obligatorio.'
    return false
  }
  if (!form.value.apellido?.trim()) {
    formError.value = 'El apellido es obligatorio.'
    return false
  }
  if (form.value.salario !== '' && Number(form.value.salario) < 0) {
    formError.value = 'El salario debe ser un número positivo.'
    return false
  }
  formError.value = null
  return true
}

async function submitForm() {
  if (!validate()) return
  loading.value = true
  const payload = {
    ...form.value,
    salario: form.value.salario !== '' ? Number(form.value.salario) : null,
  }
  try {
    if (editingId.value) {
      await api.put(`/empleados/${editingId.value}`, payload)
    } else {
      await api.post('/empleados', payload)
    }
    showModal.value = false
    resetForm()
    await fetchEmpleados()
  } catch (e) {
    formError.value = e.message
  } finally {
    loading.value = false
  }
}

async function confirmDelete(row) {
  if (!window.confirm(`¿Eliminar empleado "${row.nombre} ${row.apellido}"?`)) return
  loading.value = true
  try {
    await api.delete(`/empleados/${row.id}`)
    await fetchEmpleados()
  } catch (e) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}

onMounted(fetchEmpleados)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Empleados</h2>
        <p class="text-sm text-slate-500">Personal de la farmacia</p>
      </div>
      <button type="button" class="btn-primary" @click="openCreate">+ Nuevo empleado</button>
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
      :rows="empleados"
      :loading="loading"
    >
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
      :title="editingId ? 'Editar empleado' : 'Nuevo empleado'"
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
        <div>
          <label class="label-field">Nombre *</label>
          <input v-model="form.nombre" type="text" class="input-field" />
        </div>
        <div>
          <label class="label-field">Apellido *</label>
          <input v-model="form.apellido" type="text" class="input-field" />
        </div>
        <div>
          <label class="label-field">Puesto</label>
          <input v-model="form.puesto" type="text" class="input-field" />
        </div>
        <div>
          <label class="label-field">Teléfono</label>
          <input v-model="form.telefono" type="tel" class="input-field" />
        </div>
        <div>
          <label class="label-field">Email</label>
          <input v-model="form.email" type="email" class="input-field" />
        </div>
        <div>
          <label class="label-field">Salario (Q)</label>
          <input v-model="form.salario" type="number" min="0" step="0.01" class="input-field" />
        </div>
      </div>
    </ModalForm>
  </div>
</template>
