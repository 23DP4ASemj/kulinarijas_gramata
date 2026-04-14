<template>
  <v-app class="app-shell">
    <AppNavbar />
    <v-main class="app-main">
      <router-view />
    </v-main>
    <AppFooter />
    <AchievementUnlockToast />
  </v-app>
</template>

<script setup>
import { onBeforeUnmount, onMounted, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import AchievementUnlockToast from './components/AchievementUnlockToast.vue'
import { useAuthStore } from './stores/auth'
import { useAchievementNotificationsStore } from './stores/achievementNotifications'
import { useTheme } from 'vuetify'

const theme = useTheme()
const route = useRoute()
const auth = useAuthStore()
const achievementNotifications = useAchievementNotificationsStore()

let notificationsPollTimer = null

function stopNotificationsPolling() {
  if (notificationsPollTimer) {
    clearInterval(notificationsPollTimer)
    notificationsPollTimer = null
  }
}

function startNotificationsPolling() {
  stopNotificationsPolling()
  if (!auth.isAuthenticated) return

  achievementNotifications.fetchPending()
  notificationsPollTimer = window.setInterval(() => {
    achievementNotifications.fetchPending()
  }, 30000)
}

watchEffect(() => {
  document.body.classList.toggle('dark-theme', theme.global.name.value === 'dark')
  document.body.classList.toggle('light-theme', theme.global.name.value !== 'dark')
})

watch(() => auth.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated) {
    achievementNotifications.clear()
    stopNotificationsPolling()
    return
  }

  startNotificationsPolling()
}, { immediate: true })

watch(() => route.fullPath, () => {
  if (auth.isAuthenticated) {
    achievementNotifications.fetchPending()
  }
})

onMounted(() => {
  if (auth.isAuthenticated) {
    achievementNotifications.fetchPending()
  }
})

onBeforeUnmount(() => {
  stopNotificationsPolling()
})
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-main {
  flex: 1 0 auto;
  padding-top: calc(var(--kg-app-bar-height) + var(--kg-main-offset));
  padding-bottom: 28px;
}
</style>
