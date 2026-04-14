import { defineStore } from 'pinia'
import { api } from '../api'

export const useRecipesStore = defineStore('recipes', {
  state: () => ({
    items: [],
    pagination: { page: 1, perPage: 9, lastPage: 1, total: 0 },
    filters: { q: '', category_id: null, ingredient: '', difficulty: '', sort: 'newest' },
    current: null,
    loading: false,
    loadingMore: false,
    error: '',
    home: { top_recipes: [], top_authors: [], stats: {} },
  }),
  actions: {
    // Veido vienotu query objektu recepšu saraksta pieprasījumam.
    buildListQuery(params = {}) {
      const query = {
        page: params.page ?? this.pagination.page,
        per_page: params.per_page ?? this.pagination.perPage,
        sort: params.sort ?? this.filters.sort,
      }
      if (params.q ?? this.filters.q) query.q = params.q ?? this.filters.q
      if (params.category_id ?? this.filters.category_id) query.category_id = params.category_id ?? this.filters.category_id
      if (params.ingredient ?? this.filters.ingredient) query.ingredient = params.ingredient ?? this.filters.ingredient
      if (params.difficulty ?? this.filters.difficulty) query.difficulty = params.difficulty ?? this.filters.difficulty
      return query
    },

    mergeUniqueById(currentItems = [], incomingItems = []) {
      const merged = [...currentItems, ...incomingItems]
      const uniqueItems = []
      const seenIds = new Set()

      merged.forEach((item) => {
        const id = Number(item?.id)
        if (Number.isInteger(id) && !seenIds.has(id)) {
          seenIds.add(id)
          uniqueItems.push(item)
        }
      })

      return uniqueItems
    },

    async fetchHome() {
      const res = await api.get('/home')
      this.home = {
        top_recipes: res.data.top_recipes || [],
        top_authors: res.data.top_authors || [],
        stats: res.data.stats || {},
      }
      return this.home
    },
    async fetchList(params = {}) {
      const shouldAppend = !!params.append
      if (shouldAppend) {
        this.loadingMore = true
      } else {
        this.loading = true
      }
      this.error = ''
      try {
        const query = this.buildListQuery(params)
        const res = await api.get('/recipes', { params: query })
        const incoming = Array.isArray(res.data.data) ? res.data.data : []
        if (shouldAppend) {
          this.items = this.mergeUniqueById(this.items, incoming)
        } else {
          this.items = incoming
        }
        this.pagination.page = res.data.current_page || 1
        this.pagination.lastPage = res.data.last_page || 1
        this.pagination.total = res.data.total || this.items.length
        return res.data
      } catch (err) {
        this.error = err?.response?.data?.message || 'Neizdevās ielādēt receptes.'
        this.items = []
        throw err
      } finally {
        if (shouldAppend) {
          this.loadingMore = false
        } else {
          this.loading = false
        }
      }
    },
    async fetchOne(id) {
      this.loading = true
      this.error = ''
      try {
        const res = await api.get(`/recipes/${id}`)
        this.current = res.data.recipe || null
        return this.current
      } catch (err) {
        this.error = err?.response?.data?.message || 'Neizdevās ielādēt recepti.'
        this.current = null
        throw err
      } finally {
        this.loading = false
      }
    },
    async create(payload) {
      const res = await api.post('/recipes', payload)
      return res.data.recipe
    },
    async update(id, payload) {
      const isFormData = payload instanceof FormData
      const request = isFormData
        ? api.post(`/recipes/${id}`, payload)
        : api.patch(`/recipes/${id}`, payload)
      const res = await request
      return res.data.recipe
    },
    async remove(id) {
      const res = await api.delete(`/recipes/${id}`)
      return res.data
    },
  },
})
