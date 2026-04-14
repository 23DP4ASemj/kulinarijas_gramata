<template>
  <v-container class="subscriptions-page py-6">
    <v-card rounded="xl" class="pa-6 mb-6">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3">
        <div>
          <h1 class="text-h4 mb-1">Abonementi</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Pārvaldi autorus, kuriem seko, un atrodi jaunus iedvesmas avotus.
          </p>
        </div>
        <v-btn variant="outlined" prepend-icon="mdi-refresh" @click="loadData">Atjaunot</v-btn>
      </div>
    </v-card>

    <v-row>
      <v-col cols="12" md="6">
        <v-card rounded="xl" class="pa-4">
          <h2 class="text-h6 mb-4">Mani abonementi</h2>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

          <v-list v-if="followedAuthors.length" lines="two">
            <v-list-item v-for="author in followedAuthors" :key="author.id" class="mb-2 rounded-lg author-row">
              <template #prepend>
                <v-avatar color="primary">{{ (author.name || 'A').charAt(0).toUpperCase() }}</v-avatar>
              </template>
              <v-list-item-title>{{ author.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ author.recipes_count }} receptes • {{ author.followers_count }} sekotāji
              </v-list-item-subtitle>
              <template #append>
                <div class="d-flex ga-2">
                  <v-btn size="small" variant="tonal" :to="{ name: 'publicProfile', params: { id: author.id } }">Profils</v-btn>
                  <v-btn size="small" color="error" variant="tonal" @click="toggleFollow(author, true)">Atsekot</v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>

          <v-alert v-else type="info" variant="tonal">
            Jūs vēl nesekojat nevienam autoram.
          </v-alert>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="xl" class="pa-4">
          <h2 class="text-h6 mb-4">Ieteiktie autori</h2>

          <v-list v-if="recommendedAuthors.length" lines="two">
            <v-list-item v-for="author in recommendedAuthors" :key="author.id" class="mb-2 rounded-lg author-row">
              <template #prepend>
                <v-avatar color="secondary">{{ (author.name || 'A').charAt(0).toUpperCase() }}</v-avatar>
              </template>
              <v-list-item-title>{{ author.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ author.recipes_count }} receptes • {{ author.followers_count }} sekotāji
              </v-list-item-subtitle>
              <template #append>
                <div class="d-flex ga-2">
                  <v-btn size="small" variant="tonal" :to="{ name: 'publicProfile', params: { id: author.id } }">Profils</v-btn>
                  <v-btn size="small" color="primary" variant="flat" @click="toggleFollow(author, false)">Sekot</v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>

          <v-alert v-else type="info" variant="tonal">
            Pašlaik nav jaunu autoru ieteikumu.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="xl" class="pa-4 mt-6">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
        <h2 class="text-h6 mb-0">Jaunākās receptes no abonementiem</h2>
        <v-chip variant="tonal">Kopā: {{ feedTotal }}</v-chip>
      </div>

      <v-row v-if="isFeedLoading" class="gy-3">
        <v-col v-for="idx in 3" :key="idx" cols="12" md="4">
          <v-skeleton-loader type="image, article, actions" class="rounded-xl" />
        </v-col>
      </v-row>

      <v-alert v-else-if="!feedRecipes.length" type="info" variant="tonal">
        Pagaidām nav recepšu no autoriem, kuriem sekojat.
      </v-alert>

      <v-row v-else class="gy-3">
        <v-col v-for="item in feedRecipes" :key="item.id" cols="12" md="4">
          <v-card class="feed-card h-100" variant="flat" :to="{ name: 'recipeDetail', params: { id: item.id } }">
            <v-img v-if="item.image_url" :src="item.image_url" height="160" cover class="rounded-t-lg" />
            <div class="pa-3">
              <div class="text-subtitle-1 mb-1 text-truncate">{{ item.title }}</div>
              <div class="text-caption text-medium-emphasis mb-2">
                {{ item.author?.name || 'Autors' }} • {{ item.category?.name || 'Bez kategorijas' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                ⭐ {{ Number(item.avg_rating || 0).toFixed(1) }} • {{ item.prep_time_minutes ?? 0 }} min
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <div v-if="hasMoreFeedPages" class="d-flex justify-center mt-4">
        <v-btn color="primary" variant="tonal" :loading="isFeedLoadingMore" @click="loadMoreFeed">
          Ielādēt vēl
        </v-btn>
      </div>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2200">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from '../api'

const followedAuthors = ref([])
const recommendedAuthors = ref([])
const feedRecipes = ref([])
const feedPage = ref(1)
const feedLastPage = ref(1)
const feedTotal = ref(0)
const isFeedLoading = ref(false)
const isFeedLoadingMore = ref(false)
const error = ref('')
const snackbar = reactive({ show: false, text: '', color: 'success' })
const hasMoreFeedPages = computed(() => feedPage.value < feedLastPage.value)

function showSnackbar(text, color = 'success') {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

async function loadSubscriptionsData() {
  error.value = ''
  try {
    const res = await api.get('/subscriptions')
    followedAuthors.value = Array.isArray(res.data?.following) ? res.data.following : []
    recommendedAuthors.value = Array.isArray(res.data?.suggested) ? res.data.suggested : []
    await loadFeedRecipes(true)
  } catch (err) {
    error.value = err?.response?.data?.message || 'Neizdevās ielādēt abonementus.'
  }
}

async function fetchFeedPage(page = 1, append = false) {
  // Atsevišķi kontrolējam sākotnējo un papildu ielādi.
  if (append) {
    isFeedLoadingMore.value = true
  } else {
    isFeedLoading.value = true
  }

  try {
    const res = await api.get('/subscriptions/feed', { params: { page, per_page: 6 } })
    const rows = Array.isArray(res.data?.data) ? res.data.data : []

    feedPage.value = Number(res.data?.current_page || page)
    feedLastPage.value = Number(res.data?.last_page || 1)
    feedTotal.value = Number(res.data?.total || rows.length)
    feedRecipes.value = append ? [...feedRecipes.value, ...rows] : rows
  } finally {
    isFeedLoading.value = false
    isFeedLoadingMore.value = false
  }
}

async function loadFeedRecipes(reset = false) {
  if (reset) {
    await fetchFeedPage(1, false)
    return
  }

  if (!hasMoreFeedPages.value || isFeedLoadingMore.value) return
  await fetchFeedPage(feedPage.value + 1, true)
}

async function loadMoreFeed() {
  await loadFeedRecipes(false)
}

async function toggleFollow(author, currentlyFollowing) {
  if (!author?.id) return
  try {
    if (currentlyFollowing) {
      await api.delete(`/users/${author.id}/follow`)
      showSnackbar('Autors atsekots.')
    } else {
      await api.post(`/users/${author.id}/follow`)
      showSnackbar('Autors pievienots abonementiem.')
    }
    await loadSubscriptionsData()
  } catch (err) {
    showSnackbar(err?.response?.data?.message || 'Neizdevās mainīt abonementu.', 'error')
  }
}

onMounted(loadSubscriptionsData)
</script>

<style scoped>
.subscriptions-page {
  max-width: 1180px;
}

.author-row {
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.author-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.1);
}

.feed-card {
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feed-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.12);
}
</style>
