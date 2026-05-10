<template>
  <v-container class="recipe-form-page py-6">
    <v-card rounded="xl" class="recipe-shell pa-6">
      <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-5">
        <div>
          <h1 class="text-h5 mb-1">{{ isEdit ? 'Labot recepti' : 'Izveidot recepti' }}</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Sagatavojiet recepti ar pārskatāmu struktūru, korektu attēlu un skaidriem pagatavošanas soļiem.
          </p>
        </div>
        <v-chip color="primary" variant="tonal" size="small">{{ isEdit ? 'Rediģēšana' : 'Jauna recepte' }}</v-chip>
      </div>

      <AlertMessage v-if="error" type="error" :message="error" class="mb-4" />

      <v-form @submit.prevent="submit">
        <v-row class="gy-4">
          <v-col cols="12">
            <v-text-field
              v-model="form.title"
              label="Nosaukums"
              :error-messages="titleErrors"
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="form.description"
              label="Apraksts"
              auto-grow
              rows="3"
            />
          </v-col>

          <v-col cols="12">
            <ImageSourceInput
              v-model:url="form.image_url"
              v-model:file="imageFile"
              v-model:mode="imageInputMode"
              v-model:remove-existing="form.remove_image"
              title="Receptei pievienotais attēls"
              hint="Izvēlieties vienu avotu: faila augšupielādi vai URL. Esošu attēlu var nomainīt vai noņemt."
              :existing-image-url="existingImageUrl"
              :allow-remove-existing="isEdit && !!existingImageUrl"
              @validation="handleImageValidation"
            />
          </v-col>

          <v-col cols="12" md="5">
            <v-select
              v-model="form.category_id"
              :items="categories"
              item-title="name"
              item-value="id"
              label="Kategorija"
              :error-messages="categoryErrors"
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model.number="form.prep_time_minutes"
              type="number"
              min="0"
              label="Laiks (min)"
            />
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="form.difficulty"
              :items="difficulties"
              label="Sarežģītība"
            />
          </v-col>

          <v-col cols="12">
            <div class="quantity-shell">
              <div class="d-flex flex-wrap align-center justify-space-between ga-3">
                <div>
                  <div class="text-subtitle-1 font-weight-medium">Daudzums</div>
                  <div class="text-body-2 text-medium-emphasis">
                    Piemēram: 4 porcijas, 1 kūka, 2 burkas.
                  </div>
                </div>
                <v-btn variant="tonal" color="primary" @click="toggleQuantityField">
                  {{ showQuantityField ? 'Paslēpt daudzumu' : 'Pievienot daudzumu' }}
                </v-btn>
              </div>

              <v-expand-transition>
                <div v-if="showQuantityField" class="mt-3">
                  <v-text-field
                    v-model="form.quantity"
                    label="Daudzums"
                    placeholder="Piem. 4 porcijas"
                    hide-details="auto"
                  />
                </div>
              </v-expand-transition>
            </div>
          </v-col>

          <v-col cols="12">
            <div class="section-shell">
              <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
                <div>
                  <h2 class="text-h6 mb-1">Sastāvdaļas</h2>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Vienāda izlīdzināšana, paredzamas atstarpes un skaidras sekcijas mobilajiem un desktop ekrāniem.
                  </p>
                </div>
                <v-btn variant="tonal" color="primary" @click="addIngredient">Pievienot sastāvdaļu</v-btn>
              </div>

              <div class="ingredient-list">
                <div
                  v-for="(ingredient, idx) in form.ingredients"
                  :key="`ingredient-${idx}`"
                  class="ingredient-card"
                >
                  <div class="ingredient-card__header">
                    <div class="text-subtitle-2 font-weight-medium">Sastāvdaļa {{ idx + 1 }}</div>
                    <v-btn
                      icon="mdi-delete-outline"
                      size="small"
                      variant="text"
                      color="error"
                      :disabled="form.ingredients.length === 1"
                      @click="removeIngredient(idx)"
                    />
                  </div>

                  <div class="ingredient-card__grid">
                    <v-text-field
                      v-model="ingredient.name"
                      label="Nosaukums"
                      hide-details="auto"
                    />

                    <div class="ingredient-card__amount">
                      <v-btn variant="tonal" size="small" color="primary" @click="toggleIngredientAmount(idx)">
                        {{ ingredient.withAmount ? 'Paslēpt daudzumu' : 'Pievienot daudzumu' }}
                      </v-btn>

                      <v-expand-transition>
                        <div v-if="ingredient.withAmount" class="ingredient-card__amount-field">
                          <v-text-field
                            v-model="ingredient.amount"
                            label="Mērvienība (grammi)"
                            placeholder="Piem. 40"
                            hide-details="auto"
                          />
                        </div>
                      </v-expand-transition>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>

          <v-col cols="12">
            <div class="section-shell">
              <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
                <div>
                  <h2 class="text-h6 mb-1">Pagatavošanas soļi</h2>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Tukši soļi netiek saglabāti. Pārkārtošana notiek ar augšup/lejup pogām.
                  </p>
                </div>
                <v-btn variant="tonal" color="primary" @click="addStep">Pievienot soli</v-btn>
              </div>

              <v-alert v-if="stepsError" type="error" variant="tonal" class="mb-4">{{ stepsError }}</v-alert>

              <div class="step-list">
                <div
                  v-for="(step, idx) in form.steps"
                  :key="`step-${idx}`"
                  class="step-card"
                >
                  <div class="step-card__header">
                    <div class="text-subtitle-2 font-weight-medium">Solis {{ idx + 1 }}</div>
                    <div class="d-flex align-center ga-1">
                      <v-btn
                        icon="mdi-arrow-up"
                        size="small"
                        variant="text"
                        :disabled="idx === 0"
                        @click="moveStep(idx, -1)"
                      />
                      <v-btn
                        icon="mdi-arrow-down"
                        size="small"
                        variant="text"
                        :disabled="idx === form.steps.length - 1"
                        @click="moveStep(idx, 1)"
                      />
                      <v-btn
                        icon="mdi-delete-outline"
                        size="small"
                        variant="text"
                        color="error"
                        :disabled="form.steps.length === 1"
                        @click="removeStep(idx)"
                      />
                    </div>
                  </div>

                  <v-textarea
                    v-model="form.steps[idx]"
                    auto-grow
                    rows="2"
                    hide-details="auto"
                    :placeholder="`Apraksti soli #${idx + 1}`"
                  />
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <div class="mt-6 d-flex flex-wrap justify-end ga-2">
          <v-btn variant="text" :to="{ name: 'recipes' }">Atcelt</v-btn>
          <v-btn color="primary" type="submit" :loading="saving">
            {{ isEdit ? 'Saglabāt izmaiņas' : 'Publicēt recepti' }}
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import AlertMessage from '../components/AlertMessage.vue'
import ImageSourceInput from '../components/ImageSourceInput.vue'
import { useAuthStore } from '../stores/auth'
import { useRecipeCategoriesStore } from '../stores/recipeCategories'
import { useRecipesStore } from '../stores/recipes'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const categoriesStore = useRecipeCategoriesStore()
const recipesStore = useRecipesStore()

const isEdit = computed(() => Boolean(route.params.id))
const error = ref('')
const saving = ref(false)
const stepsError = ref('')
const imageFile = ref(null)
const imageInputMode = ref('file')
const existingImageUrl = ref('')
const imageValidation = ref({ isValid: true, urlErrors: [], fileErrors: [] })
const showQuantityField = ref(false)
const categories = computed(() => categoriesStore.items)
const difficulties = ['Easy', 'Medium', 'Hard']

const form = reactive({
  title: '',
  description: '',
  category_id: null,
  prep_time_minutes: null,
  difficulty: 'Easy',
  quantity: '',
  ingredients: [],
  steps: [''],
  image_url: '',
  remove_image: false,
})

const rules = {
  title: { required },
  category_id: { required },
}

const v$ = useVuelidate(rules, form)

const titleErrors = computed(() => {
  const errors = []
  if (!v$.value.title.$dirty) return errors
  if (!v$.value.title.required) errors.push('Nosaukums ir obligāts.')
  return errors
})

const categoryErrors = computed(() => {
  const errors = []
  if (!v$.value.category_id.$dirty) return errors
  if (!v$.value.category_id.required) errors.push('Kategorija ir obligāta.')
  return errors
})

function createIngredient() {
  return { name: '', amount: '', unit: 'grammi', withAmount: false }
}

function addIngredient() {
  form.ingredients.push(createIngredient())
}

function removeIngredient(index) {
  if (form.ingredients.length === 1) return
  form.ingredients.splice(index, 1)
}

function toggleIngredientAmount(index) {
  const ingredient = form.ingredients[index]
  ingredient.withAmount = !ingredient.withAmount
  if (!ingredient.withAmount) {
    ingredient.amount = ''
  }
}

function addStep() {
  form.steps.push('')
}

function removeStep(index) {
  if (form.steps.length === 1) return
  form.steps.splice(index, 1)
}

function moveStep(index, direction) {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= form.steps.length) return
  ;[form.steps[index], form.steps[nextIndex]] = [form.steps[nextIndex], form.steps[index]]
}

function toggleQuantityField() {
  showQuantityField.value = !showQuantityField.value
  if (!showQuantityField.value) {
    form.quantity = ''
  }
}

function handleImageValidation(payload) {
  imageValidation.value = payload
}

function appendIngredients(payload, items) {
  items
    .filter((item) => item.name)
    .forEach((item, index) => {
      payload.append(`ingredients[${index}][name]`, item.name)
      payload.append(`ingredients[${index}][amount]`, item.amount || '')
      payload.append(`ingredients[${index}][unit]`, item.unit || '')
    })
}

function appendSteps(payload, items) {
  items.forEach((step, index) => {
    payload.append(`steps[${index}]`, step)
  })
}

function getSelectedImage() {
  return Array.isArray(imageFile.value) ? imageFile.value[0] : imageFile.value
}

function buildBasePayload() {
  const quantity = showQuantityField.value ? form.quantity.trim() : ''
  const imageUrl = imageInputMode.value === 'url' ? form.image_url.trim() : ''
  const ingredients = form.ingredients
    .map((item) => ({
      name: item.name.trim(),
      amount: item.withAmount ? (item.amount?.trim() || null) : null,
      unit: item.withAmount ? 'grammi' : null,
    }))
    .filter((item) => item.name)

  return {
    title: form.title.trim(),
    description: form.description?.trim() || '',
    category_id: form.category_id,
    prep_time_minutes: form.prep_time_minutes !== null && form.prep_time_minutes !== ''
      ? Number(form.prep_time_minutes)
      : null,
    difficulty: form.difficulty || null,
    quantity: quantity || null,
    image_url: imageInputMode.value === 'url' ? (imageUrl || null) : undefined,
    remove_image: form.remove_image ? true : undefined,
    ingredients,
    steps: form.steps.map((item) => item.trim()).filter(Boolean),
  }
}

function buildFormDataPayload() {
  const selectedImage = getSelectedImage()
  const payload = new FormData()
  const basePayload = buildBasePayload()

  payload.append('title', basePayload.title)
  payload.append('description', basePayload.description)
  payload.append('category_id', String(basePayload.category_id))

  if (basePayload.prep_time_minutes !== null) {
    payload.append('prep_time_minutes', String(basePayload.prep_time_minutes))
  }

  if (basePayload.difficulty) {
    payload.append('difficulty', basePayload.difficulty)
  }

  payload.append('quantity', basePayload.quantity || '')

  if (imageInputMode.value === 'url') {
    payload.append('image_url', basePayload.image_url || '')
  }

  if (imageInputMode.value === 'file' && selectedImage instanceof File) {
    payload.append('image', selectedImage)
  }

  if (form.remove_image) {
    payload.append('remove_image', '1')
  }

  appendIngredients(payload, basePayload.ingredients)
  appendSteps(payload, basePayload.steps)

  if (isEdit.value) {
    payload.append('_method', 'PATCH')
  }

  return payload
}

function buildPayload() {
  const selectedImage = getSelectedImage()
  if (imageInputMode.value === 'file' && selectedImage instanceof File) {
    return buildFormDataPayload()
  }

  return buildBasePayload()
}

async function loadCategories() {
  await categoriesStore.fetchAll()
}

async function loadRecipe() {
  if (!isEdit.value) {
    if (!form.ingredients.length) addIngredient()
    return
  }

  const recipe = await recipesStore.fetchOne(route.params.id)
  if (!recipe) return

  form.title = recipe.title || ''
  form.description = recipe.description || ''
  form.category_id = recipe.category?.id || null
  form.prep_time_minutes = recipe.prep_time_minutes ?? null
  form.difficulty = recipe.difficulty || 'Easy'
  form.quantity = recipe.quantity || ''
  form.image_url = recipe.image_input_url || ''
  form.remove_image = false
  form.ingredients = (recipe.ingredients || []).map((item) => ({
    name: item.name,
    amount: item.amount || '',
    unit: 'grammi',
    withAmount: Boolean(item.amount),
  }))
  form.steps = Array.isArray(recipe.steps) && recipe.steps.length
    ? recipe.steps.map((item) => item.instruction || '')
    : ['']

  existingImageUrl.value = recipe.image_url || ''
  imageInputMode.value = recipe.image_source || (form.image_url ? 'url' : 'file')
  showQuantityField.value = Boolean(form.quantity)

  if (!form.ingredients.length) addIngredient()
}

async function submit() {
  v$.value.$touch()
  stepsError.value = ''
  error.value = ''

  const normalizedSteps = form.steps.map((item) => item.trim()).filter(Boolean)

  if (v$.value.$invalid) return
  if (!imageValidation.value.isValid) {
    error.value = [...imageValidation.value.urlErrors, ...imageValidation.value.fileErrors][0] || 'Attēla dati nav derīgi.'
    return
  }
  if (!normalizedSteps.length) {
    stepsError.value = 'Lūdzu, pievienojiet vismaz vienu pagatavošanas soli.'
    return
  }

  saving.value = true
  try {
    const payload = buildPayload()
    const recipe = isEdit.value
      ? await recipesStore.update(route.params.id, payload)
      : await recipesStore.create(payload)

    await auth.fetchMe()
    router.push({ name: 'recipeDetail', params: { id: recipe.id } })
  } catch (err) {
    error.value = err?.response?.data?.message || 'Neizdevās saglabāt recepti.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadCategories()
  await loadRecipe()
})
</script>

<style scoped>
.recipe-form-page {
  max-width: 1120px;
}

.recipe-shell,
.section-shell,
.quantity-shell {
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.section-shell,
.quantity-shell {
  padding: 20px;
  border-radius: 20px;
  background: rgba(var(--v-theme-surface), 0.9);
}

.ingredient-list,
.step-list {
  display: grid;
  gap: 16px;
}

.ingredient-card,
.step-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  padding: 16px;
  background: rgba(var(--v-theme-surface), 1);
}

.ingredient-card__header,
.step-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.ingredient-card__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.ingredient-card__amount {
  display: grid;
  gap: 12px;
  max-width: 320px;
}

.ingredient-card__amount-field {
  width: 100%;
}

@media (max-width: 900px) {
  .ingredient-card__grid {
    grid-template-columns: 1fr;
  }

  .ingredient-card__amount {
    max-width: none;
  }
}

:deep(.v-theme--dark) .recipe-shell,
:deep(.v-theme--dark) .section-shell,
:deep(.v-theme--dark) .quantity-shell,
:deep(.v-theme--dark) .ingredient-card,
:deep(.v-theme--dark) .step-card {
  border-color: rgba(255, 255, 255, 0.08);
}
</style>
