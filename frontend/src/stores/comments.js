import { defineStore } from 'pinia'
import { api } from '../api'

export const useCommentsStore = defineStore('comments', {
  state: () => ({
    items: [],
    pagination: { page: 1, perPage: 10, lastPage: 1, total: 0 },
    loading: false,
    error: '',
  }),
  actions: {
    async fetchForRecipe(recipeId, params = {}) {
      this.loading = true
      this.error = ''
      try {
        const query = {
          page: params.page ?? this.pagination.page,
          per_page: params.per_page ?? this.pagination.perPage,
        }
        const res = await api.get(`/recipes/${recipeId}/comments`, { params: query })
        this.items = res.data.data || []
        this.pagination.page = res.data.current_page || 1
        this.pagination.lastPage = res.data.last_page || 1
        this.pagination.total = res.data.total || this.items.length
        return res.data
      } catch (err) {
        this.error = err?.response?.data?.message || 'Neizdevās ielādēt komentārus.'
        this.items = []
        throw err
      } finally {
        this.loading = false
      }
    },
    async create(recipeId, payload) {
      const res = await api.post(`/recipes/${recipeId}/comments`, payload)
      return res.data.comment
    },
    async update(commentId, payload) {
      const res = await api.patch(`/comments/${commentId}`, payload)
      return res.data.comment
    },
    async remove(commentId) {
      const res = await api.delete(`/comments/${commentId}`)
      return res.data
    },
  },
})
