<script setup>
import { ref, computed, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import ModalForm from '@/components/ModalForm.vue'
import { useMedicamentoStore } from '@/stores/medicamentoStore'
import {
  formatQuetzales,
  getStockStatus,
  stockBadgeClass,
  stockLabel,
} from '@/utils/format'

const store = useMedicamentoStore()

const showModal = ref(false)
const editingId = ref(null)
const formError = ref(null)
const filtroCategoria = ref('')
const currentPage = ref(1)

const form = ref({
  nombre: '',
  descripcion: '',
  categoria: '',
  precio: '',
  stockActual: '',
  stockMinimo: '',
})

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'precio', label: 'Precio' },
  { key: 'stock', label: 'Stock' },
  { key: 'estado', label: 'Estado' },
  { key: 'acciones', label: 'Acciones' },
]

const categoriasUnicas = computed(() => {
  const fromStore = store.categorias.map((c) => c.nombre || c)
  const fromMeds = store.medicamentos.map((m) => m.categoria).filter(Boolean)
  return [...new Set([...fromStore, ...fromMeds])]
})

const medicamentosFiltrados = computed(() => {
  if (!filtroCategoria.value) return store.medicamentos
  return store.medicamentos.filter((m) => m.categoria === filtroCategoria.value)
})

function resetForm() {
  form.value = {
    nombre: '',
    descripcion: '',
    categoria: '',
    precio: '',
    stockActual: '',
    stockMinimo: '',
  }
  formError.value = null
  editingId.value = null
}

function openCreate() {
  resetForm()
  showModal.value = true
}

function openEdit(med) {
  editingId.value = med.id
  form.value = {
    nombre: med.nombre || '',
    descripcion: med.descripcion || '',
    categoria: med.categoria || '',
    precio: med.precio ?? '',
    stockActual: med.stockActual ?? med.stock ?? '',
    stockMinimo: med.stockMinimo ?? '',
  }
  showModal.value = true
}

function validate() {
  if (!form.value.nombre?.trim()) {
    formError.value = 'El nombre es obligatorio.'
    return false
  }
  const precio = Number(form.value.precio)
  if (!form.value.precio || precio <= 0) {
    formError.value = 'El precio debe ser un número positivo.'
    return false
  }
  const stock = Number(form.value.stockActual)
  const minimo = Number(form.value.stockMinimo)
  if (form.value.stockActual === '' || stock < 0) {
    formError.value = 'El stock actual debe ser un número mayor o igual a 0.'
    return false
  }
  if (form.value.stockMinimo === '' || minimo < 0) {
    formError.value = 'El stock mínimo debe ser un número mayor o igual a 0.'
    return false
  }
  formError.value = null
  return true
}

async function submitForm() {
  if (!validate()) return
  const payload = {
    nombre: form.value.nombre.trim(),
    descripcion: form.value.descripcion,
    categoria: form.value.categoria,
    precio: Number(form.value.precio),
    stockActual: Number(form.value.stockActual),
    stockMinimo: Number(form.value.stockMinimo),
  }
  try {
    if (editingId.value) {
      await store.updateMedicamento(editingId.value, payload)
    } else {
      await store.createMedicamento(payload)
    }
    showModal.value = false
    resetForm()
  } catch (e) {
    formError.value = e.message
  }
}

async function confirmDelete(med) {
  if (!window.confirm(`¿Eliminar "${med.nombre}"?`)) return
  try {
    await store.deleteMedicamento(med.id)
  } catch (e) {
    alert(e.message)
  }
}

function stockStatus(row) {
  return getStockStatus(row.stockActual ?? row.stock, row.stockMinimo)
}

onMounted(async () => {
  await store.fetchMedicamentos()
  await store.fetchCategorias()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Medicamentos</h2>
        <p class="text-sm text-slate-500">Catálogo y control de stock</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <select v-model="filtroCategoria" class="input-field w-auto min-w-[160px]">
          <option value="">Todas las categorías</option>
          <option v-for="cat in categoriasUnicas" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
        <button type="button" class="btn-primary" @click="openCreate">+ Nuevo medicamento</button>
      </div>
    </div>

    <DataTable
      v-model:current-page="currentPage"
      :columns="columns"
      :rows="medicamentosFiltrados"
      :loading="store.loading"
    >
      <template #cell-precio="{ row }">
        {{ formatQuetzales(row.precio) }}
      </template>
      <template #cell-stock="{ row }">
        {{ row.stockActual ?? row.stock ?? 0 }} / {{ row.stockMinimo ?? 0 }}
      </template>
      <template #cell-estado="{ row }">
        <span
          class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          :class="stockBadgeClass(stockStatus(row))"
        >
          {{ stockLabel(stockStatus(row)) }}
        </span>
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
      :title="editingId ? 'Editar medicamento' : 'Nuevo medicamento'"
      :loading="store.loading"
      size="lg"
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
          <label class="label-field">Nombre *</label>
          <input v-model="form.nombre" type="text" class="input-field" />
        </div>
        <div class="sm:col-span-2">
          <label class="label-field">Descripción</label>
          <textarea v-model="form.descripcion" rows="2" class="input-field" />
        </div>
        <div>
          <label class="label-field">Categoría</label>
          <input v-model="form.categoria" type="text" class="input-field" list="categorias-list" />
          <datalist id="categorias-list">
            <option v-for="cat in categoriasUnicas" :key="cat" :value="cat" />
          </datalist>
        </div>
        <div>
          <label class="label-field">Precio (Q) *</label>
          <input v-model="form.precio" type="number" min="0.01" step="0.01" class="input-field" />
        </div>
        <div>
          <label class="label-field">Stock actual *</label>
          <input v-model="form.stockActual" type="number" min="0" class="input-field" />
        </div>
        <div>
          <label class="label-field">Stock mínimo *</label>
          <input v-model="form.stockMinimo" type="number" min="0" class="input-field" />
        </div>
      </div>
    </ModalForm>
  </div>
</template>
