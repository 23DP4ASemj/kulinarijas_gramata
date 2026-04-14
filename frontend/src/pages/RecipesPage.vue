<template>
  <v-container class="py-6" style="max-width: 1200px;">
    <v-row class="gy-6">
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-title class="d-flex align-center ga-2 py-5">
            <v-icon icon="mdi-silverware-fork-knife" color="primary" />
            <span class="text-h6">Receptes</span>
            <v-spacer />
            <v-switch
              v-model="isInfiniteScroll"
              hide-details
              color="primary"
              density="compact"
              label="Bezgalīga ritināšana"
            />
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-form @submit.prevent="applyFilters">
              <v-row class="gy-3">
                <v-col cols="12" md="4">
                  <v-text-field v-model="filters.q" label="Meklēt" clearable hide-details />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filters.category_id"
                    :items="categories"
                    item-title="name"
                    item-value="id"
                    label="Kategorija"
                    clearable
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <v-text-field v-model="filters.ingredient" label="Sastāvdaļa" clearable hide-details />
                </v-col>
                <v-col cols="12" md="2">
                  <v-select v-model="filters.difficulty" :items="difficulties" label="Sarežģītība" clearable hide-details />
                </v-col>
                <v-col cols="12" md="2">
                  <v-select
                    v-model="filters.sort"
                    :items="sortOptions"
                    item-title="label"
                    item-value="value"
                    label="Kārtot"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="1" class="d-flex align-end">
                  <v-btn type="submit" color="primary" block>Pielietot</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-row v-if="recipesStore.loading" class="gy-4">
          <v-col v-for="i in skeletonItems" :key="i" cols="12" md="6" lg="4">
            <v-skeleton-loader type="image, article, actions" class="rounded-xl" />
          </v-col>
        </v-row>
        <AlertMessage v-else-if="recipesStore.error" type="error" :message="recipesStore.error" />
        <v-alert
          v-else-if="recipesStore.items.length === 0"
          type="info"
          variant="tonal"
          rounded="lg"
        >
          Receptes nav atrastas.
        </v-alert>

        <v-row v-else class="gy-4">
          <v-col v-for="recipe in recipesStore.items" :key="recipe.id" cols="12" md="6" lg="4">
            <RecipeCard
              :recipe="recipe"
              :can-favorite="authed"
              @open="openRecipe"
              @toggle-favorite="toggleFavorite"
            />
          </v-col>
        </v-row>

        <div v-if="!isInfiniteScroll && recipesStore.pagination.lastPage > 1" class="d-flex justify-center mt-6">
          <v-pagination v-model="pagination.page" :length="recipesStore.pagination.lastPage" :total-visible="7" />
        </div>

        <div v-if="isInfiniteScroll && recipesStore.items.length" ref="infiniteTriggerRef" class="d-flex justify-center mt-6">
          <v-progress-circular v-if="recipesStore.loadingMore" indeterminate color="primary" />
          <v-chip v-else-if="!hasMorePages" variant="tonal">Visas receptes ir ielādētas</v-chip>
          <v-btn
            v-else
            variant="tonal"
            color="primary"
            :loading="recipesStore.loadingMore"
            @click="loadNextRecipesPage"
          >
            Ielādēt vēl
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useFavoritesStore } from '../stores/favorites'
import { useRecipeCategoriesStore } from '../stores/recipeCategories'
import { useRecipesStore } from '../stores/recipes'
import AlertMessage from '../components/AlertMessage.vue'
import RecipeCard from '../components/RecipeCard.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const favoritesStore = useFavoritesStore()
const categoriesStore = useRecipeCategoriesStore()
const recipesStore = useRecipesStore()
const infiniteTriggerRef = ref(null)
const isInfiniteScroll = ref(true)
const skeletonItems = [1, 2, 3, 4, 5, 6]
let infiniteScrollObserver = null

const authed = computed(() => auth.isAuthenticated)
const hasMorePages = computed(() => recipesStore.pagination.page < recipesStore.pagination.lastPage)

const categories = computed(() => categoriesStore.items)

const sortOptions = [
  { label: 'Jaunākās', value: 'newest' },
  { label: 'Visaugstāk vērtētās', value: 'rating' },
  { label: 'Populārākās', value: 'popularity' },
]
const difficulties = ['Easy', 'Medium', 'Hard']

const filters = reactive({
  q: '',
  category_id: null,
  ingredient: '',
  difficulty: '',
  sort: 'newest',
})

const pagination = reactive({
  page: 1,
})

function openRecipe(recipe) {
  router.push({ name: 'recipeDetail', params: { id: recipe.id } })
}

async function toggleFavorite(recipe) {
  if (!authed.value) {
    router.push({ name: 'login' })
    return
  }
  const payload = recipe.is_favorited_by_me
    ? await favoritesStore.unfavorite(recipe.id)
    : await favoritesStore.favorite(recipe.id)
  recipe.is_favorited_by_me = payload.is_favorited_by_me
  recipe.favorites_count = payload.favorites_count
}

async function loadCategories() {
  try {
    await categoriesStore.fetchAll()
  } catch {
    // Store already clears its own list on error.
  }
}

function parseCategoryId(value) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

function applyFilters() {
  recipesStore.filters = { ...filters }
  reloadFirstPage()
}

async function loadNextRecipesPage() {
  // Neveicam lieku pieprasījumu, ja nav nākamās lapas vai jau notiek ielāde.
  if (!isInfiniteScroll.value || recipesStore.loadingMore || recipesStore.loading || !hasMorePages.value) {
    return
  }

  const nextPage = (recipesStore.pagination.page || 1) + 1
  await recipesStore.fetchList({ page: nextPage, ...filters, append: true })
}

function stopInfiniteObserver() {
  if (infiniteScrollObserver) {
    infiniteScrollObserver.disconnect()
    infiniteScrollObserver = null
  }
}

function startInfiniteObserver() {
  stopInfiniteObserver()
  if (!isInfiniteScroll.value || !infiniteTriggerRef.value) return

  // Kad "trigger" ieiet redzes zonā, ielādējam nākamo lapu.
  infiniteScrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadNextRecipesPage()
      }
    })
  }, { threshold: 0.2 })

  infiniteScrollObserver.observe(infiniteTriggerRef.value)
}

async function reloadFirstPage() {
  // Vienota funkcija saraksta pārlādei, lai nebūtu dublēta loģika.
  stopInfiniteObserver()
  pagination.page = 1
  await recipesStore.fetchList({ page: pagination.page, ...filters })
  if (isInfiniteScroll.value) {
    await nextTick()
    startInfiniteObserver()
  }
}

watch(
  () => pagination.page,
  () => {
    if (isInfiniteScroll.value) return
    recipesStore.fetchList({ page: pagination.page, ...filters })
  },
)

watch(
  () => route.query.q,
  (value) => {
    const nextQ = typeof value === 'string' ? value : ''
    if (nextQ === filters.q) {
      return
    }
    filters.q = nextQ
    reloadFirstPage()
  },
)

watch(
  () => route.query.category_id,
  (value) => {
    const nextCategoryId = parseCategoryId(value)
    if (nextCategoryId === filters.category_id) {
      return
    }
    filters.category_id = nextCategoryId
    reloadFirstPage()
  },
)

watch(isInfiniteScroll, async () => {
  await reloadFirstPage()
})

onMounted(async () => {
  if (route.query.q) {
    filters.q = String(route.query.q)
  }
  if (route.query.category_id) {
    filters.category_id = parseCategoryId(route.query.category_id)
  }
  await loadCategories()
  await recipesStore.fetchList({ page: pagination.page, ...filters })
  await nextTick()
  startInfiniteObserver()
})

onBeforeUnmount(() => {
  stopInfiniteObserver()
})
</script>
