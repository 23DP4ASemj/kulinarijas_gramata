<template>
  <v-dialog v-model="model" max-width="800">
    <v-card rounded="xl" elevation="2">
      <v-card-title class="d-flex align-start py-5">
        <div class="flex-grow-1">
          <div class="text-h6 text-truncate">{{ recipe?.title || 'Recipe' }}</div>
          <div class="d-flex flex-wrap align-center ga-2 mt-2">
            <v-chip size="small" color="primary" variant="tonal">
              {{ recipe?.category || 'Bez kategorijas' }}
            </v-chip>
            <span class="text-medium-emphasis">by</span>
            <v-btn
              size="small"
              variant="text"
              class="px-1"
              :disabled="!recipe?.author_id"
              @click="goToAuthor"
            >
              {{ recipe?.author || 'Unknown' }}
            </v-btn>
            <v-chip size="small" color="deep-orange" variant="tonal">
              {{ recipe?.difficulty || 'Nezināma' }}
            </v-chip>
            <v-chip size="small" color="teal" variant="tonal">
              {{ recipe?.prep_time_minutes ?? 0 }} min
            </v-chip>
          </div>
        </div>
        <v-btn
          icon
          variant="text"
          :color="recipe?.is_favorited_by_me ? 'red' : 'grey'"
          :loading="favoriteLoading"
          @click="toggleFavorite"
        >
          <v-icon :icon="recipe?.is_favorited_by_me ? 'mdi-heart' : 'mdi-heart-outline'" />
        </v-btn>
        <v-btn icon="mdi-close" variant="text" @click="model = false" />
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-6">
        <v-progress-linear v-if="loading" indeterminate class="mb-4" />
        <template v-else>
          <v-card variant="outlined" class="mb-5" rounded="xl">
            <v-card-title class="d-flex align-center ga-2 py-4">
              <v-icon icon="mdi-notebook-outline" />
              <span>Description</span>
            </v-card-title>
            <v-divider />
            <v-card-text style="white-space: pre-wrap">
              {{ recipe?.description || '' }}
            </v-card-text>
          </v-card>

          <v-card variant="outlined" class="mb-5" rounded="xl">
            <v-card-title class="d-flex align-center ga-2 py-4">
              <v-icon icon="mdi-star" color="amber" />
              <span>Rating</span>
              <span class="text-medium-emphasis">
                {{ formatNum(recipe?.avg_rating) }} ({{ recipe?.ratings_count || 0 }})
              </span>
            </v-card-title>
            <v-divider />
            <v-card-text>
              <template v-if="authed">
                <v-row class="align-center">
                  <v-col cols="12" md="8">
                    <v-rating
                      v-model="myRating"
                      color="amber"
                      hover
                      :half-increments="false"
                      length="5"
                    />
                  </v-col>
                  <v-col cols="12" md="4" class="text-end">
                    <v-btn size="small" variant="flat" color="primary" :disabled="!myRating" @click="submitRating">
                      Saglabāt
                    </v-btn>
                  </v-col>
                </v-row>
              </template>
              <template v-else>
                <div class="text-medium-emphasis">Ieiet, lai novērtētu</div>
              </template>
            </v-card-text>
          </v-card>

          <v-card variant="outlined" rounded="xl">
            <v-card-title class="d-flex align-center ga-2 py-4">
              <v-icon icon="mdi-message-text-outline" />
              <span>Comments</span>
            </v-card-title>
            <v-divider />
            <v-card-text>
              <v-alert v-if="comments.length === 0" type="info" variant="tonal">
                Vēl nav komentāru.
              </v-alert>
              <v-row v-else class="gy-3">
                <v-col v-for="c in comments" :key="c.id" cols="12">
                  <v-card variant="outlined" rounded="xl">
                    <v-card-text>
                      <div class="d-flex justify-space-between align-center mb-2">
                        <v-chip size="small" color="primary" variant="tonal">
                          {{ c.user?.name || 'User' }}
                        </v-chip>
                        <div class="text-caption text-medium-emphasis">
                          {{ formatDate(c.created_at) }}
                        </div>
                      </div>
                      <div style="white-space: pre-wrap">{{ c.text }}</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-card variant="tonal" class="mt-4" rounded="xl">
                <v-card-text>
                  <template v-if="authed">
                    <v-textarea
                      v-model="newComment"
                      label="Pievienot komentāru"
                      rows="3"
                      auto-grow
                      counter
                      :maxlength="2000"
                    />
                    <div class="d-flex justify-end">
                      <v-btn variant="flat" color="primary" :disabled="!newComment.trim()" @click="submitComment">
                        Publicēt
                      </v-btn>
                    </div>
                  </template>
                  <template v-else>
                    <div class="text-medium-emphasis">Login to comment</div>
                  </template>
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { useAuth } from '../composables/useAuth'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  recipeId: { type: Number, default: null },
})
const emit = defineEmits(['update:modelValue', 'updated', 'favorite-updated'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const { state } = useAuth()
const router = useRouter()
const authed = computed(() => !!state.token)

const loading = ref(false)
const favoriteLoading = ref(false)
const recipe = ref(null)
const comments = ref([])
const myRating = ref(null)
const newComment = ref('')

function formatNum(n) {
  const num = Number(n || 0)
  return num.toFixed(2)
}

function formatDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch {
    return ''
  }
}

function goToAuthor() {
  const authorId = recipe.value?.author_id
  if (!authorId) return
  if (state.user?.id && Number(state.user.id) === Number(authorId)) {
    router.push({ name: 'profile' })
    return
  }
  router.push({ name: 'userProfile', params: { id: authorId } })
}

async function load() {
  if (!props.recipeId) return
  loading.value = true
  try {
    const res = await api.get(`/recipes/${props.recipeId}`)
    recipe.value = res.data.recipe
    comments.value = res.data.comments || []
    myRating.value = res.data.recipe?.my_rating || null
    newComment.value = ''
    favoriteLoading.value = false
  } finally {
    loading.value = false
  }
}

async function submitRating() {
  if (!props.recipeId || !myRating.value) return
  await api.post(`/recipes/${props.recipeId}/rate`, { value: myRating.value })
  await load()
  emit('updated')
}

async function submitComment() {
  if (!props.recipeId) return
  const text = newComment.value.trim()
  if (!text) return
  await api.post(`/recipes/${props.recipeId}/comment`, { text })
  await load()
  emit('updated')
}

async function toggleFavorite() {
  if (!props.recipeId) return
  if (!authed.value) {
    router.push({ name: 'login' })
    return
  }
  favoriteLoading.value = true
  try {
    const action = recipe.value?.is_favorited_by_me ? 'delete' : 'post'
    const res = await api[action](`/recipes/${props.recipeId}/favorite`)
    if (recipe.value) {
      recipe.value.is_favorited_by_me = !!res.data.is_favorited_by_me
      recipe.value.favorites_count = res.data.favorites_count
    }
    emit('favorite-updated', {
      id: props.recipeId,
      is_favorited_by_me: !!res.data.is_favorited_by_me,
      favorites_count: res.data.favorites_count,
    })
  } finally {
    favoriteLoading.value = false
  }
}

watch(
  () => [model.value, props.recipeId],
  ([open]) => {
    if (open) load()
  }
)
</script>
