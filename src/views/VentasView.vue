<script setup>
import { ref, computed, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import { useVentaStore } from '@/stores/ventaStore'
import { useClienteStore } from '@/stores/clienteStore'
import { useMedicamentoStore } from '@/stores/medicamentoStore'
import { useAuthStore } from '@/stores/authStore'
import { formatQuetzales, formatDateTime } from '@/utils/format'

const ventaStore = useVentaStore()
const clienteStore = useClienteStore()
const medicamentoStore = useMedicamentoStore()
const authStore = useAuthStore()

const formError = ref(null)
const successMsg = ref(null)
const filtroFecha = ref('')
const busquedaMed = ref('')
const cantidadAgregar = ref(1)
const medicamentoSeleccionado = ref(null)
const currentPage = ref(1)

const modoCliente = ref('registrado')
const nombreClienteNuevo = ref('')

const form = ref({
  clienteId: '',
  empleadoId: '',
  detalles: [],
})

const historialColumns = [
  { key: 'id', label: 'ID' },
  { key: 'cliente', label: 'Cliente', accessor: (r) => r.clienteNombre || r.cliente?.nombre || '—' },
  { key: 'empleado', label: 'Empleado', accessor: (r) => r.empleadoNombre || r.empleado?.nombre || '—' },
  { key: 'fecha', label: 'Fecha', accessor: (r) => formatDateTime(r.fecha || r.fechaVenta) },
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

const totalVenta = computed(() =>
  form.value.detalles.reduce((sum, d) => sum + d.subtotal, 0)
)

const ventasFiltradas = computed(() => {
  if (!filtroFecha.value) return ventaStore.ventas
  return ventaStore.ventas.filter((v) => {
    const fecha = (v.fecha || v.fechaVenta || '').toString().split('T')[0]
    return fecha === filtroFecha.value
  })
})

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
  const stock = med.stockActual ?? med.stock ?? 0
  if (cantidad > stock) {
    formError.value = `Stock insuficiente. Disponible: ${stock}`
    return
  }
  const precio = Number(med.precio) || 0
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

function validateVenta() {
  if (modoCliente.value === 'registrado' && !form.value.clienteId) {
    formError.value = 'Seleccione un cliente registrado.'
    return false
  }
  if (modoCliente.value === 'nuevo' && !nombreClienteNuevo.value.trim()) {
    formError.value = 'Ingrese el nombre del cliente.'
    return false
  }
  if (!form.value.empleadoId) {
    formError.value = 'No se identificó el vendedor en sesión.'
    return false
  }
  if (form.value.detalles.length === 0) {
    formError.value = 'Agregue al menos un producto a la venta.'
    return false
  }
  formError.value = null
  return true
}

async function registrarVenta() {
  if (!validateVenta()) return
  successMsg.value = null
  try {
    const payload = {
      empleadoId: Number(form.value.empleadoId),
      total: totalVenta.value,
      detalles: form.value.detalles.map((d) => ({
        medicamentoId: d.medicamentoId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        subtotal: d.subtotal,
      })),
    }

    if (modoCliente.value === 'nuevo') {
      payload.nombreClienteNuevo = nombreClienteNuevo.value.trim()
    } else {
      payload.clienteId = Number(form.value.clienteId)
    }

    await ventaStore.registrarVenta(payload)
    successMsg.value = 'Venta registrada correctamente.'
    form.value.detalles = []
    if (modoCliente.value === 'registrado') {
      form.value.clienteId = ''
    } else {
      nombreClienteNuevo.value = ''
    }
    await ventaStore.fetchVentas()
    await clienteStore.fetchClientes()
  } catch (e) {
    formError.value = e.message
  }
}

onMounted(async () => {
  form.value.empleadoId = authStore.user?.idEmpleado || ''
  await Promise.all([
    clienteStore.fetchClientes(),
    medicamentoStore.fetchMedicamentos(),
    ventaStore.fetchVentas(),
  ])
})
</script>

<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-2xl font-bold text-slate-800">Ventas</h2>
      <p class="text-sm text-slate-500">Registrar ventas y consultar historial</p>
    </div>

    <div class="card space-y-4">
      <h3 class="text-lg font-semibold text-slate-800">Nueva venta</h3>

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

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label class="label-field">Cliente *</label>
          <div class="mb-2 flex gap-4 text-sm">
            <label class="flex cursor-pointer items-center gap-2">
              <input v-model="modoCliente" type="radio" value="registrado" />
              Cliente registrado
            </label>
            <label class="flex cursor-pointer items-center gap-2">
              <input v-model="modoCliente" type="radio" value="nuevo" />
              Cliente nuevo (sin registrar)
            </label>
          </div>

          <select
            v-if="modoCliente === 'registrado'"
            v-model="form.clienteId"
            class="input-field"
          >
            <option value="">— Seleccionar cliente —</option>
            <option v-for="c in clienteStore.clientes" :key="c.id" :value="c.id">
              {{ c.nombre }} {{ c.apellido }}
            </option>
          </select>

          <input
            v-else
            v-model="nombreClienteNuevo"
            type="text"
            class="input-field"
            placeholder="Nombre del cliente (ej: Juan Pérez)"
          />
          <p v-if="modoCliente === 'nuevo'" class="mt-1 text-xs text-slate-500">
            Se registrará automáticamente al guardar la venta.
          </p>
        </div>

        <div>
          <label class="label-field">Vendedor</label>
          <div
            class="flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3"
          >
            <span class="text-2xl">🧑‍💼</span>
            <div>
              <p class="font-semibold text-primary-900">{{ authStore.nombreCompleto }}</p>
              <p class="text-xs text-primary-700">
                {{ authStore.user?.cargo || authStore.rol }} · Sesión activa
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-slate-200 p-4">
        <p class="mb-3 text-sm font-medium text-slate-700">Agregar productos</p>
        <div class="flex flex-wrap gap-3">
          <div class="relative min-w-[200px] flex-1">
            <input
              v-model="busquedaMed"
              type="text"
              class="input-field"
              placeholder="Buscar medicamento..."
              @input="medicamentoSeleccionado = null"
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
                {{ med.nombre }} — {{ formatQuetzales(med.precio) }}
                (Stock: {{ med.stockActual ?? med.stock }})
              </li>
            </ul>
          </div>
          <div class="w-28">
            <input
              v-model.number="cantidadAgregar"
              type="number"
              min="1"
              class="input-field"
              placeholder="Cant."
            />
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
          Total: {{ formatQuetzales(totalVenta) }}
        </p>
        <button
          type="button"
          class="btn-primary"
          :disabled="ventaStore.loading"
          @click="registrarVenta"
        >
          {{ ventaStore.loading ? 'Registrando...' : 'Registrar Venta' }}
        </button>
      </div>
    </div>

    <div>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-slate-800">Historial de ventas</h3>
        <input v-model="filtroFecha" type="date" class="input-field w-auto" />
      </div>
      <DataTable
        v-model:current-page="currentPage"
        :columns="historialColumns"
        :rows="ventasFiltradas"
        :loading="ventaStore.loading"
      />
    </div>
  </div>
</template>
