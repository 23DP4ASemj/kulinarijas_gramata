<template>
  <v-container class="page-container py-6">
    <section id="ievads" class="hero-section soft-section">
      <div class="hero-content">
        <h1 class="text-h3 font-weight-bold mb-4">Sociāla platforma kulinārijas cienītājiem</h1>
        <p class="text-subtitle-1 text-medium-emphasis mb-6">
          Atrodi, saglabā un dalies ar receptēm modernā mācību fullstack vidē.
        </p>
        <v-btn color="primary" size="large" class="hero-cta" :to="{ name: 'recipes' }">Sākt gatavot</v-btn>
      </div>
    </section>

    <section class="soft-section">
      <v-card rounded="xl" class="soft-container latest-container" variant="flat">
        <div class="d-flex align-end justify-space-between flex-wrap ga-3 mb-6">
          <div>
            <h2 class="text-h5 mb-1">Pēdējās publicētās receptes</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">Jaunākās receptes no platformas kopienas.</p>
          </div>
          <v-btn variant="tonal" color="primary" class="pill-btn" :to="{ name: 'recipes' }">Skatīt visas</v-btn>
        </div>

        <v-row v-if="loadingLatestRecipes" class="gy-4">
          <v-col v-for="item in latestRecipeSkeletons" :key="item" cols="12" md="6" xl="4">
            <v-skeleton-loader type="image, article, actions" class="rounded-xl latest-skeleton" />
          </v-col>
        </v-row>

        <v-alert v-else-if="latestRecipesError" type="error" variant="tonal" class="mb-0">
          {{ latestRecipesError }}
        </v-alert>

        <v-alert v-else-if="!latestRecipes.length" type="info" variant="tonal" class="mb-0">
          Jaunākās receptes pašlaik nav pieejamas.
        </v-alert>

        <v-row v-else class="gy-4">
          <v-col v-for="recipe in latestRecipes" :key="recipe.id" cols="12" md="6" xl="4">
            <RecipeCard
              :recipe="recipe"
              :can-favorite="auth.isAuthenticated"
              @open="openRecipe"
              @toggle-favorite="toggleFavorite"
            />
          </v-col>
        </v-row>
      </v-card>
    </section>

    <section class="soft-section">
      <v-card rounded="xl" class="soft-container top-container">
        <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-6">
          <div>
            <h2 class="text-h5 mb-1">Top 5 receptes un autori</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Statistika atjaunojas automātiski ik pēc 60 sekundēm.
            </p>
          </div>
          <v-btn color="primary" variant="flat" class="pill-btn" :loading="loadingTop" @click="fetchHomeStats(true)">
            <v-icon icon="mdi-refresh" start />
            Atjaunot statistiku
          </v-btn>
        </div>

        <v-row class="mb-3" dense>
          <v-col cols="12" sm="4">
            <v-card class="metric-card h-100" variant="flat">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis">Kopā receptes</span>
                <v-icon icon="mdi-silverware-fork-knife" color="primary" />
              </div>
              <div class="metric-value">{{ topStats.recipes_count }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card class="metric-card h-100" variant="flat">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis">Kopā autori</span>
                <v-icon icon="mdi-account-group-outline" color="primary" />
              </div>
              <div class="metric-value">{{ topStats.authors_count }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card class="metric-card h-100" variant="flat">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis">Kopā vērtējumi</span>
                <v-icon icon="mdi-star-outline" color="primary" />
              </div>
              <div class="metric-value">{{ topStats.ratings_count }}</div>
            </v-card>
          </v-col>
        </v-row>

        <div class="d-flex flex-wrap align-center ga-2 mb-6">
          <v-chip size="small" variant="tonal">Pēdējais atjauninājums: {{ formatUpdatedAt(lastUpdatedAt) }}</v-chip>
          <v-chip v-if="hasMeInTopRecipes" size="small" color="success" variant="tonal">Tavs recepšu ieraksts ir topā</v-chip>
          <v-chip v-if="hasMeInTopAuthors" size="small" color="success" variant="tonal">Tavs profils ir autoru topā</v-chip>
        </div>

        <v-alert v-if="topError" type="error" variant="tonal" class="mb-4">{{ topError }}</v-alert>

        <v-row class="top-lists" dense>
          <v-col cols="12" md="6">
            <v-card class="list-shell h-100" variant="flat">
              <div class="d-flex align-center ga-2 mb-2 px-2">
                <v-icon icon="mdi-trophy-outline" color="primary" />
                <h3 class="text-h6 mb-0">Top 5 receptes</h3>
              </div>
              <v-divider class="mb-1" />

              <v-list v-if="topRecipes.length" lines="two" class="top-list py-0">
                <v-list-item
                  v-for="(recipe, idx) in topRecipes"
                  :key="recipe.id"
                  class="top-row"
                  :class="{ 'me-highlight': isMyRecipe(recipe) }"
                >
                  <template #prepend>
                    <v-avatar size="32" color="primary" variant="tonal">{{ idx + 1 }}</v-avatar>
                  </template>

                  <v-list-item-title class="d-flex align-center ga-2">
                    <span>{{ recipe.title }}</span>
                    <v-chip v-if="isMyRecipe(recipe)" size="x-small" color="success" variant="tonal">Tu</v-chip>
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    {{ recipe.author?.name || 'Autors nav zināms' }} • ⭐ {{ Number(recipe.avg_rating || 0).toFixed(1) }}
                    • {{ recipe.favorites_count || 0 }} favorīti • {{ recipe.ratings_count || 0 }} vērtējumi
                  </v-list-item-subtitle>

                  <template #append>
                    <v-btn size="small" variant="tonal" class="pill-btn" @click="openRecipe(recipe.id)">Atvērt</v-btn>
                  </template>
                </v-list-item>
              </v-list>

              <v-alert v-else type="info" variant="tonal" class="ma-4">Top recepšu dati nav pieejami.</v-alert>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="list-shell h-100" variant="flat">
              <div class="d-flex align-center ga-2 mb-2 px-2">
                <v-icon icon="mdi-account-star-outline" color="primary" />
                <h3 class="text-h6 mb-0">Top 5 autori</h3>
              </div>
              <v-divider class="mb-1" />

              <v-list v-if="topAuthors.length" lines="two" class="top-list py-0">
                <v-list-item
                  v-for="(author, idx) in topAuthors"
                  :key="author.id"
                  class="top-row"
                  :class="{ 'me-highlight': isMyAuthor(author) }"
                >
                  <template #prepend>
                    <v-avatar size="32" color="primary" variant="tonal">{{ idx + 1 }}</v-avatar>
                  </template>

                  <v-list-item-title class="d-flex align-center ga-2">
                    <span>{{ author.name }}</span>
                    <v-chip v-if="isMyAuthor(author)" size="x-small" color="success" variant="tonal">Tu</v-chip>
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    {{ author.recipes_count || 0 }} receptes • ⭐ {{ Number(author.avg_rating || 0).toFixed(1) }}
                    • {{ author.followers_count || 0 }} sekotāji
                  </v-list-item-subtitle>

                  <template #append>
                    <v-btn size="small" variant="tonal" class="pill-btn" @click="openAuthor(author.id)">Profils</v-btn>
                  </template>
                </v-list-item>
              </v-list>

              <v-alert v-else type="info" variant="tonal" class="ma-4">Top autoru dati nav pieejami.</v-alert>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </section>

    <section class="soft-section">
      <div class="d-flex align-end justify-space-between flex-wrap ga-2 mb-4">
        <div>
          <h2 class="text-h5 mb-1">Ātrās darbības</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">Pārej uz biežāk izmantotajām sadaļām.</p>
        </div>
      </div>

      <v-row dense class="ga-md-2">
        <v-col v-for="item in quickActions" :key="item.title" cols="12" sm="6" md="3">
          <v-card class="action-card h-100" variant="flat" :to="item.to">
            <div class="d-flex align-center ga-2 mb-2">
              <v-icon :icon="item.icon" color="primary" />
              <div class="text-subtitle-1 font-weight-medium">{{ item.title }}</div>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ item.description }}</p>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <section class="platform-section soft-section mb-2">
      <div class="d-flex justify-space-between flex-wrap align-end ga-2 mb-5">
        <h2 class="text-h4 mb-0">Kāpēc izvēlēties mūsu platformu?</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">Visas funkcijas, kas nepieciešamas kulinārijas entuziastam</p>
      </div>

      <v-row dense>
        <v-col v-for="feature in platformFeatures" :key="feature.title" cols="12" sm="6" md="3">
          <v-card class="platform-card h-100" variant="flat">
            <div class="d-flex align-center ga-2 mb-2">
              <v-icon :icon="feature.icon" color="primary" />
              <div class="text-subtitle-1 font-weight-medium">{{ feature.title }}</div>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ feature.description }}</p>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2200">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { useAuthStore } from '../stores/auth'
import { useFavoritesStore } from '../stores/favorites'
import RecipeCard from '../components/RecipeCard.vue'

const router = useRouter()
const auth = useAuthStore()
const favoritesStore = useFavoritesStore()

const quickActions = [
  {
    title: 'Pievienot recepti',
    description: 'Publicē jaunu recepti un dalies ar soļiem.',
    icon: 'mdi-plus-circle-outline',
    to: { name: 'recipeCreate' },
  },
  {
    title: 'Kolekcijas',
    description: 'Organizē iecienītās receptes kolekcijās.',
    icon: 'mdi-folder-multiple-outline',
    to: { name: 'collections' },
  },
  {
    title: 'Blogs',
    description: 'Lasi un raksti kulinārijas rakstus.',
    icon: 'mdi-notebook-edit-outline',
    to: { name: 'blogs' },
  },
  {
    title: 'Izpētīt autorus',
    description: 'Atrodi autorus un seko viņu receptēm.',
    icon: 'mdi-account-search-outline',
    to: { name: 'subscriptions' },
  },
]

const platformFeatures = [
  { title: 'Receptes', description: 'Atrodi idejas katrai dienai ar meklēšanu un filtriem.', icon: 'mdi-silverware-fork-knife' },
  { title: 'Vērtējumi', description: 'Novērtē receptes un atrodi populārākos ēdienus.', icon: 'mdi-star-outline' },
  { title: 'Sasniegumi', description: 'Saņem nozīmītes par aktivitāti un attīstību platformā.', icon: 'mdi-trophy-outline' },
  { title: 'Pieejamība', description: 'Lieto platformu ērti gan datorā, gan mobilajās ierīcēs.', icon: 'mdi-devices' },
  { title: 'Pievienot recepti', description: 'Publicē savus ēdienus un dalies ar gatavošanas soļiem.', icon: 'mdi-plus-circle-outline' },
  { title: 'Izveidot kolekciju', description: 'Grupē receptes pēc savām tēmām un sezonām.', icon: 'mdi-folder-multiple-outline' },
  { title: 'Rakstīt blogā', description: 'Veido kulinārijas rakstus un iepazīstini ar savu pieredzi.', icon: 'mdi-notebook-edit-outline' },
  { title: 'Izpētīt autorus', description: 'Atklāj aktīvos autorus un viņu populārākās receptes.', icon: 'mdi-account-search-outline' },
]

const loadingTop = ref(false)
const topError = ref('')
const topRecipes = ref([])
const topAuthors = ref([])
const latestRecipes = ref([])
const loadingLatestRecipes = ref(false)
const latestRecipesError = ref('')
const lastUpdatedAt = ref(null)
const latestRecipeSkeletons = [1, 2, 3, 4, 5, 6]
let autoRefreshTimer = null

const topStats = reactive({
  recipes_count: 0,
  authors_count: 0,
  ratings_count: 0,
})

const snackbar = reactive({
  show: false,
  text: '',
  color: 'success',
})

const hasMeInTopRecipes = computed(() => {
  if (!auth.isAuthenticated) return false
  const me = Number(auth.user?.id)
  return topRecipes.value.some((recipe) => Number(recipe.author?.id) === me)
})

const hasMeInTopAuthors = computed(() => {
  if (!auth.isAuthenticated) return false
  const me = Number(auth.user?.id)
  return topAuthors.value.some((author) => Number(author.id) === me)
})

function showSnackbar(text, color = 'success') {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

function isMyRecipe(recipe) {
  if (!auth.isAuthenticated) return false
  return Number(recipe?.author?.id) === Number(auth.user?.id)
}

function isMyAuthor(author) {
  if (!auth.isAuthenticated) return false
  return Number(author?.id) === Number(auth.user?.id)
}

function formatUpdatedAt(date) {
  if (!date) return '-'
  return date.toLocaleTimeString('lv-LV', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

async function fetchHomeStats(manual = false) {
  loadingTop.value = true
  topError.value = ''

  try {
    const res = await api.get('/home', { params: { top_limit: 5 } })
    topRecipes.value = Array.isArray(res.data?.top_recipes) ? res.data.top_recipes.slice(0, 5) : []
    topAuthors.value = Array.isArray(res.data?.top_authors) ? res.data.top_authors.slice(0, 5) : []

    topStats.recipes_count = Number(res.data?.stats?.recipes_count || 0)
    topStats.authors_count = Number(res.data?.stats?.authors_count || 0)
    topStats.ratings_count = Number(res.data?.stats?.ratings_count || 0)

    lastUpdatedAt.value = new Date()

    if (manual) {
      showSnackbar('Top statistika atjaunota.')
    }
  } catch {
    topError.value = 'Neizdevās ielādēt top statistiku.'
    if (manual) {
      showSnackbar('Neizdevās atjaunot statistiku.', 'error')
    }
  } finally {
    loadingTop.value = false
  }
}

async function fetchLatestRecipes() {
  loadingLatestRecipes.value = true
  latestRecipesError.value = ''

  try {
    const res = await api.get('/recipes', {
      params: {
        sort: 'newest',
        per_page: 6,
        page: 1,
      },
    })

    latestRecipes.value = Array.isArray(res.data?.data) ? res.data.data.slice(0, 6) : []
  } catch {
    latestRecipes.value = []
    latestRecipesError.value = 'Neizdevās ielādēt jaunākās receptes.'
  } finally {
    loadingLatestRecipes.value = false
  }
}

function openRecipe(recipeOrId) {
  const recipeId = typeof recipeOrId === 'object' ? recipeOrId?.id : recipeOrId
  if (!recipeId) {
    return
  }

  router.push({ name: 'recipeDetail', params: { id: recipeId } })
}

async function toggleFavorite(recipe) {
  if (!auth.isAuthenticated) {
    router.push({ name: 'login' })
    return
  }

  const payload = recipe.is_favorited_by_me
    ? await favoritesStore.unfavorite(recipe.id)
    : await favoritesStore.favorite(recipe.id)

  recipe.is_favorited_by_me = payload.is_favorited_by_me
  recipe.favorites_count = payload.favorites_count
}

function openAuthor(authorId) {
  if (auth.isAuthenticated && Number(auth.user?.id) === Number(authorId)) {
    router.push({ name: 'profile' })
    return
  }

  router.push({ name: 'publicProfile', params: { id: authorId } })
}

onMounted(() => {
  fetchHomeStats(false)
  fetchLatestRecipes()
  autoRefreshTimer = setInterval(() => {
    fetchHomeStats(false)
  }, 60000)
})

onBeforeUnmount(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }
})
</script>

<style scoped>
.page-container {
  max-width: 1240px;
}

#ievads {
  scroll-margin-top: 120px;
}

.hero-section {
  border-radius: 20px;
  padding: 44px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, rgba(253, 246, 238, 0.64), rgba(247, 233, 218, 0.5));
  backdrop-filter: blur(10px);
}
:global(body.dark-theme) section#ievads.hero-section.soft-section {
  border-radius: 20px;
  padding: 44px;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  background: rgba(22, 18, 16, 0.28) !important;
  backdrop-filter: blur(6px) !important;
  box-shadow: none !important;
}

.hero-content {
  max-width: 760px;
}

.hero-cta,
.pill-btn {
  border-radius: 999px;
}

.top-container {
  background: rgba(255, 255, 255, 0.66);
  backdrop-filter: blur(10px);
}

.latest-container {
  background: rgba(255, 255, 255, 0.66) !important;
  backdrop-filter: blur(10px);
}

.latest-skeleton {
  background: transparent;
}

.metric-card {
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.62) !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.metric-value {
  font-size: 1.9rem;
  font-weight: 700;
  line-height: 1.2;
}

.list-shell {
  padding: 10px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.58) !important;
  backdrop-filter: blur(10px);
}

.top-list {
  background: transparent !important;
}

.top-lists {
  row-gap: 20px;
}

.top-row {
  border-radius: 12px;
  margin: 6px 2px;
}

.top-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.me-highlight {
  border: 1px solid rgba(var(--v-theme-success), 0.42);
  background: rgba(var(--v-theme-success), 0.08);
}

.action-card,
.platform-card {
  border-radius: 16px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
}

.action-card:hover,
.platform-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
}

.platform-section {
  padding-bottom: 8px;
}

:global(body.dark-theme) section#ievads.hero-section.soft-section h1,
:global(body.dark-theme) section#ievads.hero-section.soft-section .text-h3 {
  color: #fff7ef !important;
}

:global(body.dark-theme) section#ievads.hero-section.soft-section p,
:global(body.dark-theme) section#ievads.hero-section.soft-section .text-subtitle-1,
:global(body.dark-theme) section#ievads.hero-section.soft-section .text-medium-emphasis {
  color: rgba(255, 245, 235, 0.82) !important;
}

@media (max-width: 960px) {
  .hero-section {
    padding: 28px;
  }

  .soft-section {
    margin-bottom: 56px;
  }
}
</style>

