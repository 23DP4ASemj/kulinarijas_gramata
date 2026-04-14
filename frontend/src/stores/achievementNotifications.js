import { defineStore } from 'pinia'
import { api } from '../api'
import { useAuthStore } from './auth'

function notificationId(notification) {
  return notification?.id || `${notification?.achievement_key || 'achievement'}:${notification?.tier?.key || 'locked'}`
}

export const useAchievementNotificationsStore = defineStore('achievementNotifications', {
  state: () => ({
    items: [],
    recentAchievementKeys: [],
    loading: false,
  }),
  getters: {
    activeNotification: (state) => state.items[0] || null,
  },
  actions: {
    clear() {
      this.items = []
      this.recentAchievementKeys = []
      this.loading = false
    },
    mergeNotifications(notifications) {
      const existingIds = new Set(this.items.map(notificationId))
      const existingRecentKeys = new Set(this.recentAchievementKeys)
      const freshItems = []

      for (const item of notifications) {
        const id = notificationId(item)
        if (!existingIds.has(id)) {
          freshItems.push(item)
          existingIds.add(id)
        }

        if (item?.achievement_key && !existingRecentKeys.has(item.achievement_key)) {
          this.recentAchievementKeys.push(item.achievement_key)
          existingRecentKeys.add(item.achievement_key)
        }
      }

      if (freshItems.length) {
        this.items = [...this.items, ...freshItems]
      }

      return freshItems
    },
    async fetchPending() {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) {
        this.clear()
        return []
      }

      if (this.loading) {
        return this.items
      }

      this.loading = true
      try {
        const res = await api.get('/profile/achievements/notifications')
        const incoming = Array.isArray(res.data?.notifications) ? res.data.notifications : []
        const freshItems = this.mergeNotifications(incoming)

        if (freshItems.length) {
          await api.post('/profile/achievements/notifications/read')
        }

        return freshItems
      } catch {
        return []
      } finally {
        this.loading = false
      }
    },
    dismissActive() {
      if (!this.items.length) return
      this.items.shift()
    },
  },
})
