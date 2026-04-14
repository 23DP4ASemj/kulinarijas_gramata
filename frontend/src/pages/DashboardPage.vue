<template>
  <v-container class="page-container py-6">
    <v-card rounded="xl" class="search-shell soft-container soft-section" variant="flat">
      <h1 class="text-h4 mb-2">Panelis</h1>
      <p class="text-body-1 text-medium-emphasis mb-5">
        Meklē kulinārijas datus vairākos publiskos API un saglabā meklēšanas vēsturi.
      </p>

      <v-form @submit.prevent="search">
        <v-row class="align-end" dense>
          <v-col cols="12" md="9">
            <v-text-field
              v-model="query"
              label="Meklēšanas frāze"
              placeholder="Piemērs: karbonāde, salāti, zupa"
              prepend-inner-icon="mdi-magnify"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-btn color="primary" type="submit" block size="large" class="search-btn">Meklēt</v-btn>
          </v-col>
        </v-row>
      </v-form>

      <div class="mt-3">
        <div class="text-subtitle-1 mb-2">Pēdējie meklējumi</div>
        <div class="d-flex flex-wrap ga-2">
          <v-chip
            v-for="item in history"
            :key="item"
            variant="flat"
            color="primary"
            class="history-chip"
            @click="runFromHistory(item)"
          >
            {{ item }}
          </v-chip>
        </div>
      </div>
    </v-card>

    <v-card rounded="xl" class="results-shell soft-container" variant="flat">
      <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
        <h2 class="text-h5 mb-0">Meklēšanas rezultāti</h2>
        <div class="text-caption text-medium-emphasis">Datu avoti: TheMealDB, Open Food Facts, un bloga ziņas</div>
      </div>

      <v-alert v-if="error" type="warning" variant="tonal" class="mb-4">
        Dati nav pieejami
      </v-alert>

      <v-row :key="animationKey" class="fade-in-results" dense>
        <v-col v-for="result in results" :key="result.key" cols="12" md="4" class="d-flex">
          <v-card class="interactive-card flex-grow-1" variant="flat">
            <v-img v-if="result.image" :src="result.image" height="180" cover />
            <v-card-title class="pb-1">{{ result.title }}</v-card-title>
            <v-card-subtitle class="pt-0 pb-2">
              <v-chip size="small" variant="flat" color="primary">{{ result.sourceLabel }}</v-chip>
            </v-card-subtitle>
            <v-card-text>{{ result.description }}</v-card-text>
            <v-card-actions class="px-4 pb-4">
              <v-btn
                color="primary"
                class="learn-more-btn"
                :href="result.link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Atvērt avotu
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-alert v-if="hasSearched && !error && !loading && results.length === 0" type="info" variant="tonal" class="mt-4">
        Dati nav pieejami
      </v-alert>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../api'

const HISTORY_KEY = 'kg_dashboard_history'
const HISTORY_LIMIT = 5
const RESULT_LIMIT_PER_SOURCE = 6

const query = ref('')
const results = ref([])
const history = ref([])
const loading = ref(false)
const error = ref(false)
const hasSearched = ref(false)
const animationKey = ref(0)

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    history.value = Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : []
  } catch {
    history.value = []
  }
}

function saveHistory(item) {
  const next = [item, ...history.value.filter((x) => x !== item)].slice(0, HISTORY_LIMIT)
  history.value = next
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
}

async function fetchFromMealDb(term) {
  const endpoint = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`
  const response = await fetch(endpoint)
  if (!response.ok) throw new Error('mealdb_not_ok')

  const payload = await response.json()
  const meals = Array.isArray(payload?.meals) ? payload.meals : []

  return meals.slice(0, RESULT_LIMIT_PER_SOURCE).map((meal) => ({
    key: `mealdb-${meal.idMeal}`,
    title: meal.strMeal || term,
    description: [meal.strCategory, meal.strArea].filter(Boolean).join(' • ') || 'Apraksts nav pieejams',
    image: meal.strMealThumb || '',
    link: meal.strSource || meal.strYoutube || `https://www.themealdb.com/meal/${meal.idMeal}`,
    sourceLabel: 'TheMealDB',
  }))
}

function formatOpenFoodFactsDescription(product) {
  const parts = []
  if (product.brands) parts.push(product.brands)
  if (product.categories) parts.push(String(product.categories).split(',')[0].trim())
  return parts.join(' • ') || 'Apraksts nav pieejams'
}

async function fetchFromOpenFoodFacts(term) {
  const endpoint = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&search_simple=1&action=process&json=1&page_size=12`
  const response = await fetch(endpoint)
  if (!response.ok) throw new Error('off_not_ok')

  const payload = await response.json()
  const products = Array.isArray(payload?.products) ? payload.products : []

  return products
    .filter((product) => product.product_name || product.generic_name)
    .slice(0, RESULT_LIMIT_PER_SOURCE)
    .map((product, index) => {
      const code = product.code ? String(product.code) : ''
      return {
        key: `off-${code || `${term}-${index}`}`,
        title: product.product_name || product.generic_name || term,
        description: formatOpenFoodFactsDescription(product),
        image: product.image_front_small_url || product.image_url || '',
        link: code ? `https://world.openfoodfacts.org/product/${code}` : 'https://world.openfoodfacts.org',
        sourceLabel: 'OpenFoodFacts',
      }
    })
}

async function fetchFromBlogPosts(term) {
  const response = await api.get('/blog-posts', {
    params: { q: term, per_page: 4 },
  })
  const posts = Array.isArray(response.data?.data) ? response.data.data : []
  return posts.map((post) => ({
    key: `blog-${post.id}`,
    title: post.title,
    description: post.excerpt || String(post.content || '').slice(0, 120) || 'Apraksts nav pieejams',
    image: post.image_url || '',
    link: `/blogs/${post.id}`,
    sourceLabel: 'Kulinārijas ziņas',
  }))
}

async function search() {
  const term = query.value.trim()
  hasSearched.value = true
  if (!term) {
    error.value = true
    results.value = []
    return
  }

  loading.value = true
  error.value = false
  results.value = []
  try {
    const [mealDbResult, foodFactsResult, blogResult] = await Promise.allSettled([
      fetchFromMealDb(term),
      fetchFromOpenFoodFacts(term),
      fetchFromBlogPosts(term),
    ])

    const nextResults = []

    if (mealDbResult.status === 'fulfilled') {
      nextResults.push(...mealDbResult.value)
    }
    if (foodFactsResult.status === 'fulfilled') {
      nextResults.push(...foodFactsResult.value)
    }
    if (blogResult.status === 'fulfilled') {
      nextResults.push(...blogResult.value)
    }

    results.value = nextResults.slice(0, RESULT_LIMIT_PER_SOURCE * 3)
    if (!results.value.length) {
      error.value = true
      return
    }

    saveHistory(term)
    animationKey.value += 1
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function runFromHistory(item) {
  query.value = item
  search()
}

onMounted(loadHistory)
</script>

<style scoped>
.page-container {
  max-width: 1140px;
}

.search-shell {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08);
}

.search-btn,
.learn-more-btn {
  border-radius: 999px;
}

.history-chip {
  cursor: pointer;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.16);
}

.results-shell {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.interactive-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.interactive-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
}

.learn-more-btn:hover {
  filter: brightness(1.02);
}

.fade-in-results {
  animation: fadeInUp 380ms ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

