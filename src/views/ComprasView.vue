<script setup>
import { ref, computed, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import api from '@/services/api'
import { useMedicamentoStore } from '@/stores/medicamentoStore'
import { formatQuetzales, formatDateTime } from '@/utils/format'

const medicamentoStore = useMedicamentoStore()

const compras = ref([])
const proveedores = ref([])
const loading = ref(false)
const formError = ref(null)
const successMsg = ref(null)
const filtroProveedor = ref('')
const currentPage = ref(1)

const busquedaMed = ref('')
const cantidadAgregar = ref(1)
const medicamentoSeleccionado = ref(null)

const form = ref({
  proveedorId: '',
  detalles: [],
})

const historialColumns = [
  { key: 'id', label: 'ID' },
  { key: 'proveedor', label: 'Proveedor', accessor: (r) => r.proveedorNombre || r.proveedor?.nombre || '—' },
  { key: 'fecha', label: 'Fecha', accessor: (r) => formatDateTime(r.fecha || r.fechaCompra) },
  { key: 'total', label: 'Total', accessor: (r) => formatQuetzales(r.total) },
]

const detalleColumns = [
  { key: 'nombre', label: 'Medicamento' },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'precioUnitario', label: 'Precio unit.' },
  { key: 'subtotal', label: 'Subtotal' },
  { key: 'acciones', label: '' },
]

const medicamentosBusqueda = computed(() => {
  const q = busquedaMed.value.trim().toLowerCase()
  if (!q) return medicamentoStore.medicamentos.slice(0, 8)
  return medicamentoStore.medicamentos
    .filter((m) => m.nombre?.toLowerCase().includes(q))
    .slice(0, 8)
})

const totalCompra = computed(() =>
  form.value.detalles.reduce((sum, d) => sum + d.subtotal, 0)
)

const comprasFiltradas = computed(() => {
  if (!filtroProveedor.value) return compras.value
  return compras.value.filter(
    (c) => String(c.proveedorId || c.proveedor?.id) === String(filtroProveedor.value)
  )
})

async function fetchCompras() {
  loading.value = true
  try {
    const { data } = await api.get('/compras')
    compras.value = Array.isArray(data) ? data : data?.items ?? []
  } catch (e) {
    formError.value = e.message
  } finally {
    loading.value = false
  }
}

async function fetchProveedores() {
  try {
    const { data } = await api.get('/proveedores')
    proveedores.value = Array.isArray(data) ? data : data?.items ?? []
  } catch (e) {
    formError.value = e.message
  }
}

function seleccionarMedicamento(med) {
  medicamentoSeleccionado.value = med
  busquedaMed.value = med.nombre
}

function agregarDetalle() {
  formError.value = null
  const med = medicamentoSeleccionado.value
  const cantidad = Number(cantidadAgregar.value)
  if (!med) {
    formError.value = 'Seleccione un medicamento.'
    return
  }
  if (!cantidad || cantidad <= 0) {
    formError.value = 'La cantidad debe ser un número positivo.'
    return
  }
  const precio = Number(med.precioCompra ?? med.precio) || 0
  const existente = form.value.detalles.find((d) => d.medicamentoId === med.id)
  if (existente) {
    existente.cantidad += cantidad
    existente.subtotal = existente.cantidad * existente.precioUnitario
  } else {
    form.value.detalles.push({
      medicamentoId: med.id,
      nombre: med.nombre,
      cantidad,
      precioUnitario: precio,
      subtotal: cantidad * precio,
    })
  }
  medicamentoSeleccionado.value = null
  busquedaMed.value = ''
  cantidadAgregar.value = 1
}

function quitarDetalle(index) {
  form.value.detalles.splice(index, 1)
}

function validateCompra() {
  if (!form.value.proveedorId) {
    formError.value = 'Seleccione un proveedor.'
    return false
  }
  if (form.value.detalles.length === 0) {
    formError.value = 'Agregue al menos un producto a la compra.'
    return false
  }
  formError.value = null
  return true
}

async function registrarCompra() {
  if (!validateCompra()) return
  loading.value = true
  successMsg.value = null
  try {
    await api.post('/compras', {
      proveedorId: Number(form.value.proveedorId),
      total: totalCompra.value,
      detalles: form.value.detalles.map((d) => ({
        medicamentoId: d.medicamentoId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        subtotal: d.subtotal,
      })),
    })
    successMsg.value = 'Compra registrada correctamente.'
    form.value = { proveedorId: '', detalles: [] }
    await fetchCompras()
  } catch (e) {
    formError.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchProveedores(),
    medicamentoStore.fetchMedicamentos(),
    fetchCompras(),
  ])
})
</script>

<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-2xl font-bold text-slate-800">Compras</h2>
      <p class="text-sm text-slate-500">Registrar compras a proveedores</p>
    </div>

    <div class="card space-y-4">
      <h3 class="text-lg font-semibold text-slate-800">Nueva compra</h3>

      <div
        v-if="formError"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ formError }}
      </div>
      <div
        v-if="successMsg"
        class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
      >
        {{ successMsg }}
      </div>

      <div>
        <label class="label-field">Proveedor *</label>
        <select v-model="form.proveedorId" class="input-field max-w-md">
          <option value="">— Seleccionar —</option>
          <option v-for="p in proveedores" :key="p.id" :value="p.id">
            {{ p.nombre || p.razonSocial }}
          </option>
        </select>
      </div>

      <div class="rounded-lg border border-slate-200 p-4">
        <p class="mb-3 text-sm font-medium text-slate-700">Agregar productos</p>
        <div class="flex flex-wrap gap-3">
          <div class="relative flex-1 min-w-[200px]">
            <input
              v-model="busquedaMed"
              type="text"
              class="input-field"
              placeholder="Buscar medicamento..."
            />
            <ul
              v-if="busquedaMed && medicamentosBusqueda.length"
              class="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg"
            >
              <li
                v-for="med in medicamentosBusqueda"
                :key="med.id"
                class="cursor-pointer px-3 py-2 text-sm hover:bg-primary-50"
                @click="seleccionarMedicamento(med)"
              >
                {{ med.nombre }}
              </li>
            </ul>
          </div>
          <div class="w-28">
            <input v-model.number="cantidadAgregar" type="number" min="1" class="input-field" />
          </div>
          <button type="button" class="btn-secondary" @click="agregarDetalle">Agregar</button>
        </div>
      </div>

      <DataTable
        :columns="detalleColumns"
        :rows="form.detalles"
        :paginate="false"
        empty-message="Sin productos en el detalle."
      >
        <template #cell-precioUnitario="{ row }">
          {{ formatQuetzales(row.precioUnitario) }}
        </template>
        <template #cell-subtotal="{ row }">
          {{ formatQuetzales(row.subtotal) }}
        </template>
        <template #cell-acciones="{ row }">
          <button
            type="button"
            class="text-sm text-red-600 hover:underline"
            @click="quitarDetalle(form.detalles.indexOf(row))"
          >
            Quitar
          </button>
        </template>
      </DataTable>

      <div class="flex items-center justify-between border-t border-slate-200 pt-4">
        <p class="text-xl font-bold text-slate-800">
          Total: {{ formatQuetzales(totalCompra) }}
        </p>
        <button type="button" class="btn-primary" :disabled="loading" @click="registrarCompra">
          {{ loading ? 'Registrando...' : 'Registrar Compra' }}
        </button>
      </div>
    </div>

    <div>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-slate-800">Historial de compras</h3>
        <select v-model="filtroProveedor" class="input-field w-auto min-w-[200px]">
          <option value="">Todos los proveedores</option>
          <option v-for="p in proveedores" :key="p.id" :value="p.id">
            {{ p.nombre || p.razonSocial }}
          </option>
        </select>
      </div>
      <DataTable
        v-model:current-page="currentPage"
        :columns="historialColumns"
        :rows="comprasFiltradas"
        :loading="loading"
      />
    </div>
  </div>
</template>
