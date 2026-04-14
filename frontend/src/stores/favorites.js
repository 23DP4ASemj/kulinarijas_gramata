import { defineStore } from 'pinia'
import { api } from '../api'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    processing: false,
    error: '',
  }),
  actions: {
    async favorite(recipeId) {
      this.processing = true
      this.error = ''
      try {
        const res = await api.post(`/recipes/${recipeId}/favorite`)
        return res.data
      } catch (err) {
        this.error = err?.response?.data?.message || 'Neizdevās pievienot favorītiem.'
        throw err
      } finally {
        this.processing = false
      }
    },
    async unfavorite(recipeId) {
      this.processing = true
      this.error = ''
      try {
        const res = await api.delete(`/recipes/${recipeId}/favorite`)
        return res.data
      } catch (err) {
        this.error = err?.response?.data?.message || 'Neizdevās noņemt no favorītiem.'
        throw err
      } finally {
        this.processing = false
      }
    },
  },
})
