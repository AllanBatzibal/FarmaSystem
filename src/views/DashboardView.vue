<script setup>
import { ref, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import StockAlertCard from '@/components/StockAlertCard.vue'
import { useClienteStore } from '@/stores/clienteStore'
import { useMedicamentoStore } from '@/stores/medicamentoStore'
import { useVentaStore } from '@/stores/ventaStore'
import { useInventarioStore } from '@/stores/inventarioStore'
import { formatQuetzales, formatDateTime } from '@/utils/format'

const clienteStore = useClienteStore()
const medicamentoStore = useMedicamentoStore()
const ventaStore = useVentaStore()
const inventarioStore = useInventarioStore()

const loading = ref(true)
const error = ref(null)
const resumen = ref({
  totalVentasDia: 0,
  totalComprasMes: 0,
  stockCritico: 0,
  totalClientes: 0,
})
const ultimasVentas = ref([])

const ventasColumns = [
  { key: 'id', label: 'ID' },
  { key: 'cliente', label: 'Cliente', accessor: (r) => r.clienteNombre || r.cliente?.nombre || '—' },
  { key: 'fecha', label: 'Fecha', accessor: (r) => formatDateTime(r.fecha || r.fechaVenta) },
  { key: 'total', label: 'Total', accessor: (r) => formatQuetzales(r.total) },
]

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    await Promise.all([
      clienteStore.fetchClientes().catch(() => {}),
      medicamentoStore.fetchMedicamentos().catch(() => {}),
      inventarioStore.fetchInventario().catch(() => {}),
    ])

    const [resumenDia, resumenCompras, ventas] = await Promise.all([
      ventaStore.getResumenDia().catch(() => ({ totalVentas: 0 })),
      inventarioStore.getResumenComprasMes().catch(() => ({ totalCompras: 0 })),
      ventaStore.fetchUltimasVentas(5).catch(() => []),
    ])

    ultimasVentas.value = ventas
    resumen.value = {
      totalVentasDia: resumenDia.totalVentas ?? resumenDia.total ?? 0,
      totalComprasMes: resumenCompras.totalCompras ?? resumenCompras.total ?? 0,
      stockCritico: inventarioStore.stockCriticoCount || medicamentoStore.medicamentosCriticos.length,
      totalClientes: clienteStore.clientes.length,
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const cards = [
  { key: 'ventas', label: 'Ventas del día', color: 'bg-emerald-500', icon: '💰' },
  { key: 'compras', label: 'Compras del mes', color: 'bg-blue-500', icon: '📥' },
  { key: 'critico', label: 'Stock crítico', color: 'bg-red-500', icon: '⚠️' },
  { key: 'clientes', label: 'Clientes registrados', color: 'bg-violet-500', icon: '👥' },
]

function cardValue(key) {
  const map = {
    ventas: formatQuetzales(resumen.value.totalVentasDia),
    compras: formatQuetzales(resumen.value.totalComprasMes),
    critico: resumen.value.stockCritico,
    clientes: resumen.value.totalClientes,
  }
  return map[key]
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-slate-800">Dashboard</h2>
      <p class="text-sm text-slate-500">Resumen general del sistema</p>
    </div>

    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div
        class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"
      />
    </div>

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="card in cards"
          :key="card.key"
          class="card flex items-center gap-4"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl text-xl text-white"
            :class="card.color"
          >
            {{ card.icon }}
          </div>
          <div>
            <p class="text-sm text-slate-500">{{ card.label }}</p>
            <p class="text-2xl font-bold text-slate-800">{{ cardValue(card.key) }}</p>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="card">
          <h3 class="mb-4 text-lg font-semibold text-slate-800">Últimas 5 ventas</h3>
          <DataTable
            :columns="ventasColumns"
            :rows="ultimasVentas"
            :paginate="false"
            empty-message="No hay ventas recientes."
          />
        </div>

        <div class="card">
          <h3 class="mb-4 text-lg font-semibold text-red-800">
            Alertas de stock mínimo
          </h3>
          <div
            v-if="medicamentoStore.medicamentosCriticos.length === 0"
            class="rounded-lg bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-700"
          >
            No hay medicamentos en stock crítico.
          </div>
          <div v-else class="max-h-80 space-y-2 overflow-y-auto">
            <StockAlertCard
              v-for="med in medicamentoStore.medicamentosCriticos"
              :key="med.id"
              :medicamento="med"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
