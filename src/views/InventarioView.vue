<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInventarioStore } from '@/stores/inventarioStore'
import { getStockStatus, stockBadgeClass, stockLabel } from '@/utils/format'

const store = useInventarioStore()
const filtro = ref('todos')

const filtros = [
  { value: 'todos', label: 'Todos' },
  { value: 'ok', label: 'Stock OK' },
  { value: 'bajo', label: 'Stock bajo' },
  { value: 'critico', label: 'Stock crítico' },
]

const itemsFiltrados = computed(() => store.filterByStatus(store.inventario, filtro.value))

function progressPercent(item) {
  const actual = Number(item.stockActual ?? item.stock) || 0
  const minimo = Number(item.stockMinimo) || 1
  const target = Math.max(minimo * 2, minimo)
  return Math.min(100, Math.round((actual / target) * 100))
}

function progressColor(item) {
  const status = getStockStatus(item.stockActual ?? item.stock, item.stockMinimo)
  if (status === 'critico') return 'bg-red-500'
  if (status === 'bajo') return 'bg-amber-500'
  return 'bg-emerald-500'
}

onMounted(() => store.fetchInventario())
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Inventario</h2>
        <p class="text-sm text-slate-500">Stock actual vs stock mínimo</p>
      </div>
      <div class="flex gap-2">
        <button
          v-for="f in filtros"
          :key="f.value"
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition"
          :class="
            filtro === f.value
              ? 'bg-primary-600 text-white'
              : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
          "
          @click="filtro = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <div v-if="store.loading" class="flex justify-center py-20">
      <div
        class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"
      />
    </div>

    <div v-else-if="itemsFiltrados.length === 0" class="card text-center text-slate-500">
      No hay medicamentos con el filtro seleccionado.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="item in itemsFiltrados"
        :key="item.id"
        class="card"
      >
        <div class="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 class="font-semibold text-slate-800">
              {{ item.nombre || item.nombreMedicamento }}
            </h3>
            <p class="text-sm text-slate-500">{{ item.categoria || 'Sin categoría' }}</p>
          </div>
          <span
            class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
            :class="
              stockBadgeClass(
                getStockStatus(item.stockActual ?? item.stock, item.stockMinimo)
              )
            "
          >
            {{
              stockLabel(
                getStockStatus(item.stockActual ?? item.stock, item.stockMinimo)
              )
            }}
          </span>
        </div>

        <div class="mb-1 flex justify-between text-sm text-slate-600">
          <span>
            Actual: <strong>{{ item.stockActual ?? item.stock ?? 0 }}</strong>
          </span>
          <span>
            Mínimo: <strong>{{ item.stockMinimo ?? 0 }}</strong>
          </span>
        </div>

        <div class="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="progressColor(item)"
            :style="{ width: `${progressPercent(item)}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
