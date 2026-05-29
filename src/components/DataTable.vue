<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyMessage: {
    type: String,
    default: 'No hay registros para mostrar.',
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  paginate: {
    type: Boolean,
    default: true,
  },
})

const currentPage = defineModel('currentPage', { type: Number, default: 1 })

const totalPages = computed(() =>
  props.paginate ? Math.max(1, Math.ceil(props.rows.length / props.pageSize)) : 1
)

const paginatedRows = computed(() => {
  if (!props.paginate) return props.rows
  const start = (currentPage.value - 1) * props.pageSize
  return props.rows.slice(start, start + props.pageSize)
})

function getCellValue(row, col) {
  if (typeof col.accessor === 'function') return col.accessor(row)
  return row[col.key]
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div
        class="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"
      />
    </div>

    <div v-else-if="rows.length === 0" class="py-12 text-center text-sm text-slate-500">
      {{ emptyMessage }}
    </div>

    <template v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th
                v-for="col in columns"
                :key="col.key"
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                :class="col.headerClass"
              >
                {{ col.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(row, idx) in paginatedRows"
              :key="row.id ?? idx"
              class="hover:bg-slate-50"
            >
              <td
                v-for="col in columns"
                :key="col.key"
                class="whitespace-nowrap px-4 py-3 text-slate-700"
                :class="col.cellClass"
              >
                <slot :name="`cell-${col.key}`" :row="row" :value="getCellValue(row, col)">
                  {{ getCellValue(row, col) }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="paginate && rows.length > pageSize"
        class="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600"
      >
        <span>
          Página {{ currentPage }} de {{ totalPages }} ({{ rows.length }} registros)
        </span>
        <div class="flex gap-2">
          <button type="button" class="btn-secondary" :disabled="currentPage <= 1" @click="prevPage">
            Anterior
          </button>
          <button
            type="button"
            class="btn-secondary"
            :disabled="currentPage >= totalPages"
            @click="nextPage"
          >
            Siguiente
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
