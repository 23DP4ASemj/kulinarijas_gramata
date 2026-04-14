<template>
  <v-container class="py-6" style="max-width: 1100px;">
    <Loader v-if="recipesStore.loading" />
    <AlertMessage v-else-if="recipesStore.error" type="error" :message="recipesStore.error" />

    <div v-else-if="recipe" class="d-flex flex-column ga-6">
      <v-card rounded="xl" class="pa-6">
        <v-img
          v-if="recipe.image_url"
          :src="recipe.image_url"
          height="280"
          cover
          class="rounded-lg mb-4"
        />
        <div class="d-flex justify-space-between flex-wrap ga-4">
          <div>
            <h2 class="text-h5 mb-2">{{ recipe.title }}</h2>
            <div class="text-medium-emphasis mb-2">{{ recipe.description }}</div>
            <div class="d-flex flex-wrap ga-2 align-center">
              <v-chip size="small" color="primary" variant="tonal">{{ recipe.category?.name || 'Bez kategorijas' }}</v-chip>
              <v-chip size="small" color="deep-orange" variant="tonal">{{ recipe.difficulty || 'Nav norādīts' }}</v-chip>
              <span class="text-medium-emphasis">{{ recipe.prep_time_minutes ?? 0 }} min</span>
              <v-chip v-if="recipe.quantity" size="small" color="secondary" variant="tonal">{{ recipe.quantity }}</v-chip>
            </div>
            <div class="mt-3 text-medium-emphasis">Autors: {{ recipe.author?.name || 'Nezināms' }}</div>
          </div>
          <div class="d-flex flex-column align-end ga-2">
            <FavoritesButton
              :is-favorited="recipe.is_favorited_by_me"
              :count="recipe.favorites_count || 0"
              :disabled="!authed"
              @toggle="toggleFavorite"
            />
            <StarsRating :value="recipe.avg_rating || 0" readonly show-value />
            <v-btn
              v-if="canEditRecipe"
              size="small"
              variant="tonal"
              @click="editRecipe"
            >
              Labot recepti
            </v-btn>
            <v-btn
              v-if="canDeleteRecipe"
              size="small"
              variant="tonal"
              color="error"
              @click="deleteRecipe"
            >
              Dzēst recepti
            </v-btn>
          </div>
        </div>
      </v-card>

      <v-card rounded="xl" class="pa-6">
        <div class="d-flex align-center justify-space-between flex-wrap ga-4">
          <h3 class="text-h6">Tavs vērtējums</h3>
          <StarsRating :value="recipe.my_rating || 0" :readonly="!authed" @rate="rateRecipe" />
        </div>
      </v-card>

      <v-card rounded="xl" class="pa-6">
        <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
          <div>
            <h3 class="text-h6 mb-1">Sastāvdaļas</h3>
            <div class="text-body-2 text-medium-emphasis">Vienmērīgs izkārtojums, stabilas atstarpes un labāka lasāmība.</div>
          </div>
          <v-chip v-if="recipe.quantity" size="small" variant="tonal" color="primary">Daudzums: {{ recipe.quantity }}</v-chip>
        </div>

        <div v-if="recipe.ingredients?.length" class="ingredients-grid">
          <div v-for="item in recipe.ingredients || []" :key="item.id" class="ingredient-detail-card">
            <div class="text-subtitle-2 font-weight-medium ingredient-detail-card__name">{{ item.name }}</div>
            <div class="text-body-2 text-medium-emphasis ingredient-detail-card__meta">
              {{ item.amount ? `${item.amount} ${item.unit || 'grammi'}` : 'Daudzums nav norādīts' }}
            </div>
          </div>
        </div>
        <v-alert v-else type="info" variant="tonal">Sastāvdaļas šai receptei nav pievienotas.</v-alert>
      </v-card>

      <v-card rounded="xl" class="pa-6">
        <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
          <h3 class="text-h6 mb-0">Pagatavošanas soļi</h3>
          <v-chip size="small" variant="tonal">
            Izpildīti: {{ completedSteps.length }}/{{ recipe.steps?.length || 0 }}
          </v-chip>
        </div>

        <v-alert v-if="!(recipe.steps || []).length" type="info" variant="tonal">
          Šai receptei vēl nav pievienoti pagatavošanas soļi.
        </v-alert>

        <ol v-else class="steps-list">
          <li v-for="step in recipe.steps" :key="step.id || step.step_number" class="mb-3">
            <div class="step-row" :class="{ 'step-row--done': isStepDone(step.step_number) }">
              <v-checkbox-btn
                :model-value="isStepDone(step.step_number)"
                color="primary"
                @update:model-value="toggleStepDone(step.step_number, $event)"
              />
              <div class="step-content">
                <div class="text-caption text-medium-emphasis mb-1">Solis {{ step.step_number }}</div>
                <div class="text-body-1">{{ step.instruction }}</div>
              </div>
            </div>
          </li>
        </ol>
      </v-card>

      <v-card rounded="xl" class="pa-6">
        <h3 class="text-h6 mb-4">Līdzīgas receptes</h3>

        <v-row v-if="similarLoading" class="gy-3">
          <v-col v-for="idx in 3" :key="idx" cols="12" md="4">
            <v-skeleton-loader type="image, article, actions" class="rounded-xl" />
          </v-col>
        </v-row>

        <v-alert v-else-if="similarError" type="error" variant="tonal">{{ similarError }}</v-alert>
        <v-alert v-else-if="!similarRecipes.length" type="info" variant="tonal">
          Līdzīgas receptes nav atrastas.
        </v-alert>

        <v-row v-else class="gy-3">
          <v-col v-for="item in similarRecipes" :key="item.id" cols="12" md="4">
            <v-card class="similar-card h-100" variant="flat" @click="openSimilarRecipe(item)">
              <v-img v-if="item.image_url" :src="item.image_url" height="145" cover class="rounded-t-lg" />
              <div class="pa-3">
                <div class="d-flex align-center justify-space-between ga-2 mb-2">
                  <div class="text-subtitle-1 text-truncate">{{ item.title }}</div>
                  <v-btn
                    icon="mdi-heart"
                    size="x-small"
                    :variant="item.is_favorited_by_me ? 'flat' : 'tonal'"
                    :color="item.is_favorited_by_me ? 'error' : 'primary'"
                    @click.stop="toggleSimilarFavorite(item)"
                  />
                </div>
                <div class="text-caption text-medium-emphasis mb-2">
                  {{ item.category?.name || 'Bez kategorijas' }} • {{ item.prep_time_minutes ?? 0 }} min
                </div>
                <div class="text-caption text-medium-emphasis">
                  ⭐ {{ Number(item.avg_rating || 0).toFixed(1) }} • {{ item.favorites_count || 0 }} favorīti
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>

      <v-card rounded="xl" class="pa-6">
        <h3 class="text-h6 mb-4">Komentāri</h3>
        <v-form v-if="authed" @submit.prevent="submitComment" class="mb-4">
          <v-textarea
            v-model="commentForm.text"
            label="Pievienot komentāru"
            auto-grow
            rows="2"
            :error-messages="commentErrors"
          />
          <v-btn color="primary" type="submit">Publicēt komentāru</v-btn>
        </v-form>
        <CommentList
          :comments="commentsStore.items"
          :current-user-id="auth.user?.id"
          :is-admin="auth.isAdmin"
          @delete="deleteComment"
        />
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { api } from '../api'
import { useAuthStore } from '../stores/auth'
import { useCommentsStore } from '../stores/comments'
import { useFavoritesStore } from '../stores/favorites'
import { useRatingsStore } from '../stores/ratings'
import { useRecipesStore } from '../stores/recipes'
import AlertMessage from '../components/AlertMessage.vue'
import CommentList from '../components/CommentList.vue'
import FavoritesButton from '../components/FavoritesButton.vue'
import Loader from '../components/Loader.vue'
import StarsRating from '../components/StarsRating.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const recipesStore = useRecipesStore()
const commentsStore = useCommentsStore()
const favoritesStore = useFavoritesStore()
const ratingsStore = useRatingsStore()

const authed = computed(() => auth.isAuthenticated)
const recipeId = computed(() => route.params.id)
const recipe = computed(() => recipesStore.current)
const canDeleteRecipe = computed(() => {
  if (!authed.value || !recipe.value) return false
  return auth.isAdmin || Number(recipe.value.author?.id) === Number(auth.user?.id)
})
const canEditRecipe = computed(() => {
  if (!authed.value || !recipe.value) return false
  return auth.isAdmin || Number(recipe.value.author?.id) === Number(auth.user?.id)
})

const commentForm = reactive({ text: '' })
const completedSteps = ref([])
const similarRecipes = ref([])
const similarLoading = ref(false)
const similarError = ref('')
const rules = { text: { required } }
const v$ = useVuelidate(rules, commentForm)
const stepsStoragePrefix = 'kg_recipe_steps_done_'

const commentErrors = computed(() => {
  const errors = []
  if (!v$.value.text.$dirty) return errors
  if (!v$.value.text.required) errors.push('Komentārs ir obligāts')
  return errors
})

async function load() {
  await recipesStore.fetchOne(recipeId.value)
  await commentsStore.fetchForRecipe(recipeId.value)
  await loadSimilarRecipes()
}

function loadCompletedSteps() {
  const id = recipe.value?.id
  if (!id) {
    completedSteps.value = []
    return
  }

  try {
    const raw = localStorage.getItem(`${stepsStoragePrefix}${id}`)
    const parsed = raw ? JSON.parse(raw) : []
    completedSteps.value = Array.isArray(parsed)
      ? parsed.map((v) => Number(v)).filter((v) => Number.isInteger(v))
      : []
  } catch {
    completedSteps.value = []
  }
}

function saveCompletedSteps() {
  const id = recipe.value?.id
  if (!id) return
  localStorage.setItem(`${stepsStoragePrefix}${id}`, JSON.stringify(completedSteps.value))
}

function isStepDone(stepNumber) {
  return completedSteps.value.includes(Number(stepNumber))
}

function toggleStepDone(stepNumber, checked) {
  const number = Number(stepNumber)
  if (!Number.isInteger(number)) return

  if (checked) {
    if (!completedSteps.value.includes(number)) {
      completedSteps.value = [...completedSteps.value, number].sort((a, b) => a - b)
    }
  } else {
    completedSteps.value = completedSteps.value.filter((item) => item !== number)
  }

  saveCompletedSteps()
}

async function toggleFavorite() {
  if (!authed.value) {
    router.push({ name: 'login' })
    return
  }
  const payload = recipe.value.is_favorited_by_me
    ? await favoritesStore.unfavorite(recipeId.value)
    : await favoritesStore.favorite(recipeId.value)
  recipe.value.is_favorited_by_me = payload.is_favorited_by_me
  recipe.value.favorites_count = payload.favorites_count
}

async function toggleSimilarFavorite(item) {
  if (!authed.value) {
    router.push({ name: 'login' })
    return
  }

  const payload = item.is_favorited_by_me
    ? await favoritesStore.unfavorite(item.id)
    : await favoritesStore.favorite(item.id)

  item.is_favorited_by_me = payload.is_favorited_by_me
  item.favorites_count = payload.favorites_count
}

async function rateRecipe(value) {
  if (!authed.value) {
    router.push({ name: 'login' })
    return
  }
  const stats = await ratingsStore.setRating(recipeId.value, value)
  recipe.value.my_rating = value
  recipe.value.avg_rating = stats.avg_rating
  recipe.value.ratings_count = stats.ratings_count
}

async function submitComment() {
  v$.value.$touch()
  if (v$.value.$invalid) return
  const comment = await commentsStore.create(recipeId.value, { text: commentForm.text })
  commentsStore.items.unshift(comment)
  commentForm.text = ''
  v$.value.$reset()
}

async function deleteComment(comment) {
  await commentsStore.remove(comment.id)
  commentsStore.items = commentsStore.items.filter((item) => item.id !== comment.id)
}

async function deleteRecipe() {
  const ok = window.confirm('Vai tiešām dzēst šo recepti?')
  if (!ok) return
  await recipesStore.remove(recipeId.value)
  router.push({ name: 'recipes' })
}

function editRecipe() {
  router.push({ name: 'recipeEdit', params: { id: recipeId.value } })
}

function openSimilarRecipe(item) {
  router.push({ name: 'recipeDetail', params: { id: item.id } })
}

async function loadSimilarRecipes() {
  similarLoading.value = true
  similarError.value = ''

  try {
    const res = await api.get(`/recipes/${recipeId.value}/similar`, { params: { limit: 5 } })
    const items = Array.isArray(res.data?.data) ? res.data.data : []
    similarRecipes.value = items
  } catch {
    similarError.value = 'Neizdevās ielādēt līdzīgās receptes.'
    similarRecipes.value = []
  } finally {
    similarLoading.value = false
  }
}

onMounted(load)

watch(
  () => recipe.value?.id,
  () => {
    loadCompletedSteps()
  },
  { immediate: true }
)

watch(
  () => route.params.id,
  () => {
    load()
  }
)
</script>

<style scoped>
.steps-list {
  margin: 0;
  padding-left: 22px;
}

.step-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(var(--v-theme-surface), 1);
}

.step-row--done {
  background: rgba(var(--v-theme-success), 0.08);
  border-color: rgba(var(--v-theme-success), 0.35);
}

.step-content {
  flex: 1;
}

.ingredients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.ingredient-detail-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(var(--v-theme-surface), 1);
}

.ingredient-detail-card__name {
  line-height: 1.3;
}

.ingredient-detail-card__meta {
  max-width: 26ch;
}

.similar-card {
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.similar-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.1);
}
</style>
