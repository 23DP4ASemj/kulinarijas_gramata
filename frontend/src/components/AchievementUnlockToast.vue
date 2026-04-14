<template>
  <v-snackbar
    v-model="visible"
    location="top right"
    timeout="3600"
    rounded="xl"
    class="achievement-toast"
    content-class="achievement-toast__content"
  >
    <div v-if="activeNotification" class="achievement-toast__body" :style="toastStyle">
      <div class="achievement-toast__icon">
        <v-icon :icon="activeNotification.tier?.icon || 'mdi-trophy-outline'" size="26" />
      </div>
      <div class="achievement-toast__content-block">
        <div class="achievement-toast__eyebrow">Jauns sasniegums</div>
        <div class="achievement-toast__title">{{ activeNotification.title }}</div>
        <div class="achievement-toast__message">{{ activeNotification.message }}</div>
      </div>
    </div>

    <template #actions>
      <v-btn variant="text" color="white" @click="visible = false">
        Aizvērt
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useAchievementNotificationsStore } from '../stores/achievementNotifications'

const notifications = useAchievementNotificationsStore()
const visible = ref(false)
const activeNotification = computed(() => notifications.activeNotification)
const toastStyle = computed(() => ({
  '--achievement-toast-accent': activeNotification.value?.tier?.color || '#D4A72C',
}))

watch(activeNotification, (next) => {
  visible.value = !!next
}, { immediate: true })

watch(visible, (next, previous) => {
  if (!next && previous && activeNotification.value) {
    notifications.dismissActive()
  }
})
</script>

<style scoped>
.achievement-toast :deep(.achievement-toast__content) {
  padding: 0 !important;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 42%),
    linear-gradient(135deg, rgba(16, 24, 40, 0.96), rgba(37, 46, 63, 0.98));
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.32);
}

.achievement-toast__body {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: min(92vw, 380px);
  padding: 16px 18px;
}

.achievement-toast__body::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--achievement-toast-accent);
}

.achievement-toast__icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  color: #fff;
  background: linear-gradient(135deg, var(--achievement-toast-accent), rgba(255, 255, 255, 0.2));
  box-shadow: 0 12px 28px color-mix(in srgb, var(--achievement-toast-accent) 35%, transparent);
}

.achievement-toast__content-block {
  min-width: 0;
}

.achievement-toast__eyebrow {
  margin-bottom: 2px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.66);
}

.achievement-toast__title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.25;
}

.achievement-toast__message {
  margin-top: 4px;
  font-size: 0.92rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.82);
}
</style>
