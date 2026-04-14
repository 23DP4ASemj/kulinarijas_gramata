import { defineStore } from 'pinia'
import { api } from '../api'

export const useRecipeCategoriesStore = defineStore('recipeCategories', {
  state: () => ({
    items: [],
    loading: false,
    loaded: false,
    error: '',
  }),
  actions: {
    normalizeItems(payload) {
      const source = Array.isArray(payload) ? payload : []
      const uniqueByName = new Map()

      source.forEach((item) => {
        const id = Number(item?.id)
        const name = String(item?.name || '').trim()

        if (!Number.isInteger(id) || !name || uniqueByName.has(name)) {
          return
        }

        uniqueByName.set(name, { id, name })
      })

      return [...uniqueByName.values()]
    },

    async fetchAll(force = false) {
      if (this.loaded && !force) {
        return this.items
      }

      this.loading = true
      this.error = ''

      try {
        const res = await api.get('/categories')
        this.items = this.normalizeItems(res.data?.data || res.data || [])
        this.loaded = true
        return this.items
      } catch (err) {
        this.error = err?.response?.data?.message || 'Neizdevās ielādēt kategorijas.'
        this.items = []
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
