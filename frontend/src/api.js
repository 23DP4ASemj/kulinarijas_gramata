import axios from 'axios'
import { clearStoredAuth, getStoredToken } from './utils/authStorage'

function normalizeBaseUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '')
}

function resolveApiBaseUrl() {
  const envApiUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL)
  if (envApiUrl) {
    return envApiUrl
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:8000/api'
  }

  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${window.location.protocol}//${hostname}:8000/api`
  }

  return '/api'
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredAuth()
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)
