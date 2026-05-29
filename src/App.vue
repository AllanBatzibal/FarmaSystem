<script setup>
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import SideBar from '@/components/SideBar.vue'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const authStore = useAuthStore()

const esLogin = computed(() => route.name === 'login')
const layoutVisible = computed(() => authStore.isAuthenticated && !esLogin.value)
</script>

<template>
  <LoginView v-if="esLogin" />
  <div v-else-if="layoutVisible" class="flex min-h-screen flex-col">
    <NavBar />
    <div class="flex flex-1">
      <SideBar />
      <main class="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-primary-50/30 p-6 lg:p-8">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>
    </div>
  </div>
  <RouterView v-else />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
