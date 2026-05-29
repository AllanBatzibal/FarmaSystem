<script setup>
import { ref, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import ModalForm from '@/components/ModalForm.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useClienteStore } from '@/stores/clienteStore'

const store = useClienteStore()

const showModal = ref(false)
const editingId = ref(null)
const formError = ref(null)
const currentPage = ref(1)

const form = ref({
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  nit: '',
  direccion: '',
})

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'apellido', label: 'Apellido' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'email', label: 'Email' },
  { key: 'nit', label: 'NIT' },
  { key: 'acciones', label: 'Acciones' },
]

function resetForm() {
  form.value = {
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    nit: '',
    direccion: '',
  }
  formError.value = null
  editingId.value = null
}

function openCreate() {
  resetForm()
  showModal.value = true
}

function openEdit(cliente) {
  editingId.value = cliente.id
  form.value = {
    nombre: cliente.nombre || '',
    apellido: cliente.apellido || '',
    telefono: cliente.telefono || '',
    email: cliente.email || '',
    nit: cliente.nit || '',
    direccion: cliente.direccion || '',
  }
  formError.value = null
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
  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    formError.value = 'Ingrese un correo electrónico válido.'
    return false
  }
  formError.value = null
  return true
}

async function submitForm() {
  if (!validate()) return
  try {
    if (editingId.value) {
      await store.updateCliente(editingId.value, { ...form.value })
    } else {
      await store.createCliente({ ...form.value })
    }
    showModal.value = false
    resetForm()
  } catch (e) {
    formError.value = e.message
  }
}

async function confirmDelete(cliente) {
  if (!window.confirm(`¿Eliminar al cliente "${cliente.nombre} ${cliente.apellido}"?`)) return
  try {
    await store.deleteCliente(cliente.id)
  } catch (e) {
    alert(e.message)
  }
}

onMounted(() => store.fetchClientes())
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Clientes" subtitle="Gestión de clientes registrados">
      <template #actions>
        <button type="button" class="btn-primary" @click="openCreate">+ Nuevo cliente</button>
      </template>
    </PageHeader>

    <div v-if="store.error" class="alert-error">
      {{ store.error }}
    </div>

    <DataTable
      v-model:current-page="currentPage"
      :columns="columns"
      :rows="store.clientes"
      :loading="store.loading"
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
      :title="editingId ? 'Editar cliente' : 'Nuevo cliente'"
      :loading="store.loading"
      :submit-label="editingId ? 'Actualizar' : 'Crear'"
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
          <input v-model="form.nombre" type="text" class="input-field" required />
        </div>
        <div>
          <label class="label-field">Apellido *</label>
          <input v-model="form.apellido" type="text" class="input-field" required />
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
          <label class="label-field">NIT</label>
          <input v-model="form.nit" type="text" class="input-field" />
        </div>
        <div class="sm:col-span-2">
          <label class="label-field">Dirección</label>
          <input v-model="form.direccion" type="text" class="input-field" />
        </div>
      </div>
    </ModalForm>
  </div>
</template>
