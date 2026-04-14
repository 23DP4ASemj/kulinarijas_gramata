<template>
  <v-container class="public-profile py-6">
    <v-card rounded="xl" class="pa-6 mb-6">
      <div v-if="loading" class="py-4">
        <v-progress-linear indeterminate />
      </div>

      <template v-else>
        <v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert>

        <template v-else-if="profile">
          <div class="d-flex flex-wrap align-center justify-space-between ga-4">
            <div class="d-flex align-center ga-4">
              <v-avatar size="72" color="primary">
                <v-img v-if="profile.avatar_url" :src="profile.avatar_url" cover />
                <template v-else>{{ profileInitial }}</template>
              </v-avatar>
              <div>
                <h1 class="text-h5 mb-1">{{ profile.name }}</h1>
                <div class="d-flex align-center ga-2">
                  <v-chip size="small" color="primary" variant="tonal">{{ roleLabel }}</v-chip>
                  <span class="text-caption text-medium-emphasis">{{ profile.email }}</span>
                </div>
              </div>
            </div>

            <div class="d-flex align-center ga-2">
              <v-btn
                v-if="canFollow"
                color="primary"
                :variant="profile.is_following ? 'outlined' : 'flat'"
                @click="toggleFollow"
              >
                {{ profile.is_following ? 'Atsekot' : 'Sekot' }}
              </v-btn>
              <v-btn variant="tonal" :to="{ name: 'recipes', query: { q: profile.name } }">Skatīt receptes</v-btn>
            </div>
          </div>

          <v-row class="mt-4">
            <v-col cols="12" sm="4">
              <v-card class="pa-4 stat-card" variant="tonal">
                <div class="text-caption text-medium-emphasis">Receptes</div>
                <div class="text-h6">{{ profile.recipes_count || 0 }}</div>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card class="pa-4 stat-card" variant="tonal">
                <div class="text-caption text-medium-emphasis">Vērtējums</div>
                <div class="text-h6">{{ Number(profile.average_rating_across_recipes || 0).toFixed(1) }}</div>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card class="pa-4 stat-card" variant="tonal">
                <div class="text-caption text-medium-emphasis">Sekotāji</div>
                <div class="text-h6">{{ profile.followers_count || 0 }}</div>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </template>
    </v-card>

    <v-card rounded="xl" class="pa-4">
      <h2 class="text-h6 mb-4">Autora receptes</h2>
      <v-row v-if="recipes.length" class="gy-4">
        <v-col v-for="recipe in recipes" :key="recipe.id" cols="12" md="6">
          <v-card class="pa-4 recipe-card" variant="outlined">
            <div class="text-subtitle-1">{{ recipe.title }}</div>
            <div class="text-caption text-medium-emphasis mb-3">{{ recipe.description || 'Apraksts nav pieejams' }}</div>
            <v-btn size="small" variant="tonal" :to="{ name: 'recipeDetail', params: { id: recipe.id } }">Atvērt</v-btn>
          </v-card>
        </v-col>
      </v-row>
      <v-alert v-else type="info" variant="tonal">Šim autoram vēl nav publicētu recepšu.</v-alert>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2200">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const error = ref('')
const profile = ref(null)
const recipes = ref([])
const snackbar = reactive({ show: false, text: '', color: 'success' })

const profileInitial = computed(() => (profile.value?.name?.charAt(0) || 'A').toUpperCase())
const canFollow = computed(() => {
  if (!profile.value) return false
  if (!auth.isAuthenticated) return true
  return Number(auth.user?.id) !== Number(profile.value.id)
})

const roleLabel = computed(() => {
  const role = profile.value?.role
  if (role === 'admin') return 'Administrators'
  if (role === 'author') return 'Autors'
  return 'Lietotājs'
})

function showSnackbar(text, color = 'success') {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

function normalizeProfile(payload) {
  if (!payload) return null
  return {
    id: Number(payload.id),
    name: payload.name || 'Autors',
    email: payload.email || '',
    role: payload.role || 'user',
    avatar_url: payload.avatar_url || '',
    recipes_count: Number(payload.recipes_count || 0),
    average_rating_across_recipes: Number(payload.average_rating_across_recipes || 0),
    followers_count: Number(payload.followers_count || 0),
    is_following: !!payload.is_following,
  }
}

async function loadProfile() {
  const id = Number(route.params.id)
  if (!id) {
    error.value = 'Nederīgs autora identifikators.'
    return
  }

  if (auth.isAuthenticated && Number(auth.user?.id) === id) {
    router.replace({ name: 'profile' })
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await api.get(`/users/${id}`)
    const user = normalizeProfile(res.data?.user)
    if (!user) {
      error.value = 'Autora profils nav pieejams.'
      return
    }

    profile.value = user
    recipes.value = Array.isArray(res.data?.recipes) ? res.data.recipes : []
  } catch (err) {
    error.value = err?.response?.data?.message || 'Neizdevās ielādēt autora profilu.'
  } finally {
    loading.value = false
  }
}

async function toggleFollow() {
  if (!profile.value?.id) return

  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  try {
    if (profile.value.is_following) {
      const res = await api.delete(`/users/${profile.value.id}/follow`)
      profile.value.is_following = !!res.data?.is_following
      profile.value.followers_count = Number(res.data?.followers_count || 0)
      showSnackbar('Autors atsekots.')
    } else {
      const res = await api.post(`/users/${profile.value.id}/follow`)
      profile.value.is_following = !!res.data?.is_following
      profile.value.followers_count = Number(res.data?.followers_count || 0)
      showSnackbar('Tagad sekojat autoram.')
    }
  } catch (err) {
    showSnackbar(err?.response?.data?.message || 'Neizdevās mainīt abonementu.', 'error')
  }
}

watch(() => route.params.id, loadProfile)
onMounted(loadProfile)
</script>

<style scoped>
.public-profile {
  max-width: 1180px;
}

.stat-card,
.recipe-card {
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.stat-card:hover,
.recipe-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.11);
}
</style>
