import { defineStore } from 'pinia'
import { api } from '../api'
import { clearStoredAuth, getStoredToken, getStoredUser, setStoredAuth } from '../utils/authStorage'

function extractApiError(err, fallback) {
  const responseData = err?.response?.data

  if (responseData?.errors && typeof responseData.errors === 'object') {
    const firstKey = Object.keys(responseData.errors)[0]
    const firstMessage = firstKey ? responseData.errors[firstKey]?.[0] : ''
    if (firstMessage) return firstMessage
  }

  if (responseData?.message) return responseData.message
  if (err?.message === 'Network Error') return 'Neizdevās pieslēgties API serverim'
  return fallback
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getStoredToken(),
    user: getStoredUser(),
    loading: false,
    error: '',
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    role: (state) => state.user?.role || 'guest',
    isAdmin: (state) => state.user?.role === 'admin',
    isAuthor: (state) => state.user?.role === 'author',
    isVerified: (state) => !!state.user?.email_verified_at,
  },
  actions: {
    clearError() {
      this.error = ''
    },
    setAuth(token, user) {
      this.token = token || ''
      this.user = user || null
      setStoredAuth(this.token, this.user)
    },
    clearAuth() {
      this.token = ''
      this.user = null
      this.error = ''
      clearStoredAuth()
    },
    async register(payload) {
      this.loading = true
      this.error = ''
      try {
        const res = await api.post('/auth/register', payload)
        this.setAuth(res.data.token, res.data.user)
        return res.data
      } catch (err) {
        this.error = extractApiError(err, 'Reģistrācija neizdevās')
        throw err
      } finally {
        this.loading = false
      }
    },
    async login(payload) {
      this.loading = true
      this.error = ''
      try {
        const res = await api.post('/auth/login', payload)
        this.setAuth(res.data.token, res.data.user)
        return res.data
      } catch (err) {
        this.error = extractApiError(err, 'Autorizācija neizdevās')
        throw err
      } finally {
        this.loading = false
      }
    },
    async logout() {
      try {
        await api.post('/auth/logout')
      } finally {
        this.clearAuth()
      }
    },
    async fetchMe() {
      if (!this.token) return null
      try {
        const res = await api.get('/auth/me')
        this.setAuth(this.token, res.data.user)
        return res.data.user
      } catch (err) {
        this.clearAuth()
        return null
      }
    },
    async resendVerification() {
      const res = await api.post('/email/verification-notification')
      return res.data
    },
  },
})
