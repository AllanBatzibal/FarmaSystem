<script setup>
import { formatQuetzales } from '@/utils/format'

defineProps({
  medicamento: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div
    class="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3"
  >
    <div>
      <p class="font-medium text-red-900">
        {{ medicamento.nombre || medicamento.nombreMedicamento }}
      </p>
      <p class="text-sm text-red-700">
        Stock: {{ medicamento.stockActual ?? medicamento.stock ?? 0 }} /
        Mínimo: {{ medicamento.stockMinimo ?? medicamento.stockMinimo ?? 0 }}
      </p>
    </div>
    <div class="text-right">
      <span class="rounded-full bg-red-200 px-2.5 py-0.5 text-xs font-semibold text-red-800">
        Crítico
      </span>
      <p v-if="medicamento.precio" class="mt-1 text-xs text-red-600">
        {{ formatQuetzales(medicamento.precio) }}
      </p>
    </div>
  </div>
</template>
