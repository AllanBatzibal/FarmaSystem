<script setup>
const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Formulario' },
  loading: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Guardar' },
  size: { type: String, default: 'md' },
})

const emit = defineEmits(['close', 'submit'])

const sizeClass = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

function onBackdropClick(e) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click="onBackdropClick"
      >
        <div
          class="w-full rounded-2xl bg-white shadow-xl"
          :class="sizeClass[size] || sizeClass.md"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 class="text-lg font-semibold text-slate-800">{{ title }}</h2>
            <button
              type="button"
              class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Cerrar"
              @click="emit('close')"
            >
              ✕
            </button>
          </div>

          <form class="px-6 py-4" @submit.prevent="emit('submit')">
            <slot />

            <div class="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button type="button" class="btn-secondary" :disabled="loading" @click="emit('close')">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" :disabled="loading">
                <span v-if="loading" class="inline-flex items-center gap-2">
                  <span
                    class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  />
                  Guardando...
                </span>
                <span v-else>{{ submitLabel }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
