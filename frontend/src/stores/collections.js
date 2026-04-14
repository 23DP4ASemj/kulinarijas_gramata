import { defineStore } from 'pinia'
import { api } from '../api'

export const useCollectionsStore = defineStore('collections', {
  state: () => ({
    items: [],
    loading: false,
    error: '',
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = ''
      try {
        const res = await api.get('/collections')
        this.items = res.data.data || res.data || []
        return this.items
      } catch (err) {
        this.error = err?.response?.data?.message || 'Neizdevās ielādēt kolekcijas.'
        this.items = []
        throw err
      } finally {
        this.loading = false
      }
    },
    async create(payload) {
      const res = await api.post('/collections', payload)
      return res.data.collection
    },
    async update(id, payload) {
      const res = await api.put(`/collections/${id}`, payload)
      return res.data.collection
    },
    async remove(id) {
      const res = await api.delete(`/collections/${id}`)
      return res.data
    },
    async addRecipe(collectionId, recipeId) {
      const res = await api.post(`/collections/${collectionId}/recipes/${recipeId}`)
      return res.data
    },
    async removeRecipe(collectionId, recipeId) {
      const res = await api.delete(`/collections/${collectionId}/recipes/${recipeId}`)
      return res.data
    },
  },
})
