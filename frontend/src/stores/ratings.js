import { defineStore } from 'pinia'
import { api } from '../api'

export const useRatingsStore = defineStore('ratings', {
  state: () => ({
    processing: false,
    error: '',
  }),
  actions: {
    async setRating(recipeId, value) {
      this.processing = true
      this.error = ''
      try {
        const res = await api.put(`/recipes/${recipeId}/rating`, { value })
        return res.data
      } catch (err) {
        this.error = err?.response?.data?.message || 'Neizdevās saglabāt vērtējumu.'
        throw err
      } finally {
        this.processing = false
      }
    },
    async removeRating(recipeId) {
      this.processing = true
      this.error = ''
      try {
        const res = await api.delete(`/recipes/${recipeId}/rating`)
        return res.data
      } catch (err) {
        this.error = err?.response?.data?.message || 'Neizdevās noņemt vērtējumu.'
        throw err
      } finally {
        this.processing = false
      }
    },
  },
})
