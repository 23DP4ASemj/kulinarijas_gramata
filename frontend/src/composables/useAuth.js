import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { clearStoredAuth, getStoredToken } from '../utils/authStorage'

export function isAuthenticated() {
  return !!getStoredToken()
}

export function getToken() {
  return getStoredToken()
}

export function clearAuth() {
  clearStoredAuth()
}

export function useAuth() {
  const store = useAuthStore()
  const { token, user } = storeToRefs(store)

  return {
    state: { token, user },
    register: store.register,
    login: store.login,
    logout: store.logout,
    setUser: (nextUser) => store.setAuth(store.token, nextUser),
  }
}
