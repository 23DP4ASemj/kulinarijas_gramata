<template>
  <v-container class="py-6" style="max-width: 1100px;">
    <v-row justify="center">
      <v-col cols="12" md="9">
        <v-card elevation="2" rounded="xl" class="soft-shell">
          <v-card-title class="d-flex align-center ga-2 py-5">
            <v-icon icon="mdi-plus-circle-outline" color="primary" />
            <span class="text-h6">Pievienot recepti</span>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-alert v-if="success" type="success" variant="tonal" class="mb-4" rounded="lg">
              Recepte veiksmīgi izveidota.
            </v-alert>
            <v-alert v-if="saveError" type="error" variant="tonal" class="mb-4" rounded="lg">
              {{ saveError }}
            </v-alert>

            <v-form @submit.prevent="submitRecipe">
              <v-row class="gy-4">
                <v-col cols="12">
                  <v-text-field
                    v-model="recipeTitle"
                    label="Nosaukums"
                    hint="Izvēlies skaidru un saprotamu receptes nosaukumu."
                    persistent-hint
                    required
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="recipeDescription"
                    label="Apraksts"
                    hint="Norādi receptes īsu ievadu."
                    persistent-hint
                    auto-grow
                    rows="4"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="imageUrl"
                    label="Attēla saite (URL)"
                    placeholder="https://..."
                    hide-details="auto"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="prepTimeMinutes"
                    type="number"
                    min="0"
                    label="Pagatavošanas laiks (minūtēs)"
                    hint="Neobligāts aptuvenais laiks."
                    persistent-hint
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="difficultyLevel"
                    :items="difficultyLevels"
                    label="Sarežģītība"
                    hint="Neobligāts sarežģītības līmenis."
                    persistent-hint
                    clearable
                  />
                </v-col>

                <v-col cols="12" md="8">
                  <v-select
                    v-model="selectedCategoryId"
                    :items="categoryOptions"
                    item-title="name"
                    item-value="id"
                    label="Kategorija"
                    hint="Izvēlies atbilstošāko kategoriju."
                    persistent-hint
                    required
                    :loading="isLoadingCategories"
                  />
                </v-col>

                <v-col cols="12">
                  <v-card variant="flat" class="steps-shell">
                    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
                      <div>
                        <h3 class="text-h6 mb-1">Sastāvdaļas</h3>
                        <p class="text-body-2 text-medium-emphasis mb-0">
                          Pievieno un pārkārto sastāvdaļas ar vilkšanu.
                        </p>
                      </div>
                      <v-btn type="button" color="primary" variant="tonal" @click="addIngredient">
                        + Pievienot sastāvdaļu
                      </v-btn>
                    </div>

                    <div
                      v-for="(ingredient, idx) in ingredients"
                      :key="`ingredient-${idx}`"
                      class="step-item mb-3"
                      draggable="true"
                      @dragstart="startIngredientDrag(idx)"
                      @dragover.prevent
                      @drop="dropIngredient(idx)"
                    >
                      <div class="d-flex align-center justify-space-between mb-2">
                        <div class="text-subtitle-2 d-flex align-center ga-1">
                          <v-icon icon="mdi-drag-vertical" size="18" />
                          Sastāvdaļa {{ idx + 1 }}
                        </div>
                        <v-btn
                          type="button"
                          icon="mdi-delete-outline"
                          size="x-small"
                          variant="text"
                          color="error"
                          :disabled="ingredients.length === 1"
                          @click="removeIngredient(idx)"
                        />
                      </div>

                      <v-row dense>
                        <v-col cols="12" md="5">
                          <v-text-field v-model="ingredient.name" label="Nosaukums" hide-details="auto" />
                        </v-col>
                        <v-col cols="6" md="4">
                          <v-text-field
                            v-model="ingredient.amount"
                            :label="ingredient.withAmount ? 'Mērvienība (grammi)' : 'Mērvienība (izslēgts)'"
                            type="number"
                            min="0"
                            hide-details="auto"
                            :disabled="!ingredient.withAmount"
                          />
                        </v-col>
                        <v-col cols="6" md="3" class="d-flex align-center">
                          <v-btn
                            icon
                            variant="text"
                            :color="ingredient.withAmount ? 'primary' : 'grey'"
                            @click="toggleIngredientAmount(idx)"
                            :aria-label="ingredient.withAmount ? 'Slēgt daudzumu' : 'Atvērt daudzumu'"
                          >
                            <v-icon :icon="ingredient.withAmount ? 'mdi-eye' : 'mdi-eye-off'" />
                          </v-btn>
                          <span class="text-caption ms-1">Daudzums</span>
                        </v-col>
                      </v-row>
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="12">
                  <v-card variant="flat" class="steps-shell">
                    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
                      <div>
                        <h3 class="text-h6 mb-1">Soļi</h3>
                        <p class="text-body-2 text-medium-emphasis mb-0">Pievieno pagatavošanas soļus pareizā secībā.</p>
                      </div>
                      <v-btn type="button" color="primary" variant="tonal" @click="addStep">+ Pievienot soli</v-btn>
                    </div>

                    <v-alert v-if="stepsError" type="error" variant="tonal" class="mb-3">
                      {{ stepsError }}
                    </v-alert>

                    <div v-for="(step, idx) in steps" :key="idx" class="step-item mb-3">
                      <div class="d-flex align-center justify-space-between mb-2">
                        <div class="text-subtitle-2">Solis {{ idx + 1 }}</div>
                        <div class="d-flex ga-1">
                          <v-btn
                            type="button"
                            icon="mdi-arrow-up"
                            size="x-small"
                            variant="text"
                            :disabled="idx === 0"
                            @click="moveStepUp(idx)"
                          />
                          <v-btn
                            type="button"
                            icon="mdi-arrow-down"
                            size="x-small"
                            variant="text"
                            :disabled="idx === steps.length - 1"
                            @click="moveStepDown(idx)"
                          />
                          <v-btn
                            type="button"
                            icon="mdi-delete-outline"
                            size="x-small"
                            variant="text"
                            color="error"
                            :disabled="steps.length === 1"
                            @click="removeStep(idx)"
                          />
                        </div>
                      </div>
                      <v-textarea
                        v-model="steps[idx]"
                        auto-grow
                        rows="2"
                        density="comfortable"
                        :placeholder="`Apraksti soli #${idx + 1}`"
                        hide-details="auto"
                      />
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="12" class="d-flex flex-wrap justify-end ga-2">
                  <v-btn type="button" variant="text" :disabled="isSaving" @click="resetForm">
                    Notīrīt
                  </v-btn>
                  <v-btn
                    type="submit"
                    color="primary"
                    variant="flat"
                    :loading="isSaving"
                    :disabled="!selectedCategoryId"
                  >
                    Publicēt
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRecipeCategoriesStore } from '../stores/recipeCategories'

const categoriesStore = useRecipeCategoriesStore()
const categoryOptions = ref([])
const recipeTitle = ref('')
const recipeDescription = ref('')
const selectedCategoryId = ref(null)
const prepTimeMinutes = ref(null)
const difficultyLevel = ref(null)
const difficultyLevels = ['Easy', 'Medium', 'Hard']
const imageUrl = ref('')
const imageFile = ref(null)
const ingredients = ref([{ name: '', amount: '', unit: 'grammi', withAmount: true }])
const steps = ref([''])
const draggingIngredientIndex = ref(null)
const isSaving = ref(false)
const isLoadingCategories = ref(false)
const saveError = ref('')
const success = ref(false)
const stepsError = ref('')

function resetForm() {
  recipeTitle.value = ''
  recipeDescription.value = ''
  imageUrl.value = ''
  imageFile.value = null
  selectedCategoryId.value = null
  prepTimeMinutes.value = null
  difficultyLevel.value = null
  ingredients.value = [{ name: '', amount: '', unit: '', withAmount: true }]
  steps.value = ['']
  stepsError.value = ''
}

function addIngredient() {
  ingredients.value.push({ name: '', amount: '', unit: 'grammi', withAmount: true })
}

function removeIngredient(index) {
  if (ingredients.value.length === 1) return
  ingredients.value.splice(index, 1)
}

function toggleIngredientAmount(index) {
  ingredients.value[index].withAmount = !ingredients.value[index].withAmount
}

function startIngredientDrag(index) {
  draggingIngredientIndex.value = index
}

function dropIngredient(dropIndex) {
  // Pārkārtojam sastāvdaļu secību ar drag & drop.
  const dragIndex = draggingIngredientIndex.value
  if (dragIndex === null || dragIndex === dropIndex) return
  const arr = [...ingredients.value]
  const [dragged] = arr.splice(dragIndex, 1)
  arr.splice(dropIndex, 0, dragged)
  ingredients.value = arr
  draggingIngredientIndex.value = null
}

function addStep() {
  steps.value.push('')
}

function removeStep(index) {
  if (steps.value.length === 1) return
  steps.value.splice(index, 1)
}

function moveStepUp(index) {
  if (index <= 0) return
  const arr = [...steps.value]
  ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
  steps.value = arr
}

function moveStepDown(index) {
  if (index >= steps.value.length - 1) return
  const arr = [...steps.value]
  ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
  steps.value = arr
}

function buildStepsPayload() {
  return steps.value.map((step) => step.trim())
}

function buildIngredientsPayload() {
  return ingredients.value
    .map((item) => ({
      name: String(item.name || '').trim(),
      amount: item.withAmount ? String(item.amount || '').trim() : null,
      unit: item.withAmount ? (String(item.unit || '').trim() || 'g') : null,
    }))
    .filter((item) => item.name)
}

function appendIngredients(payload, items) {
  items
    .filter((item) => item.name)
    .forEach((item, index) => {
      payload.append(`ingredients[${index}][name]`, item.name)
      if (item.withAmount && item.amount) {
        payload.append(`ingredients[${index}][amount]`, item.amount)
      } else {
        payload.append(`ingredients[${index}][amount]`, '')
      }
      payload.append(`ingredients[${index}][unit]`, 'grammi')
    })
}

async function loadCategoryOptions() {
  isLoadingCategories.value = true
  try {
    categoryOptions.value = await categoriesStore.fetchAll()
  } finally {
    isLoadingCategories.value = false
  }
}

async function submitRecipe() {
  // Galvenā saglabāšanas plūsma: validējam, veidojam payload, sūtām API.
  isSaving.value = true
  saveError.value = ''
  success.value = false
  stepsError.value = ''

  try {
    const normalizedSteps = buildStepsPayload()
    if (!normalizedSteps.length || normalizedSteps.some((step) => !step)) {
      stepsError.value = 'Lūdzu, aizpildi vismaz vienu soli, un katram solim jābūt ar tekstu.'
      return
    }

    const formData = new FormData()
    formData.append('title', recipeTitle.value)
    formData.append('description', recipeDescription.value)
    formData.append('category_id', String(selectedCategoryId.value))
    formData.append('image_url', imageUrl.value || '')
    if (imageFile.value instanceof File) {
      formData.append('image', imageFile.value)
    }
    if (prepTimeMinutes.value !== null && prepTimeMinutes.value !== '') {
      formData.append('prep_time_minutes', String(Number(prepTimeMinutes.value)))
    }
    if (difficultyLevel.value) {
      formData.append('difficulty', difficultyLevel.value)
    }
    appendIngredients(formData, buildIngredientsPayload())
    normalizedSteps.forEach((step, index) => {
      formData.append(`steps[${index}]`, step)
    })

    await api.post('/recipes', formData)

    resetForm()
    success.value = true
  } catch (e) {
    saveError.value = e?.response?.data?.message || 'Neizdevās izveidot recepti.'
  } finally {
    isSaving.value = false
  }
}

onMounted(loadCategoryOptions)
</script>

<style scoped>
.soft-shell {
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.steps-shell {
  padding: 18px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.step-item {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(var(--v-theme-surface), 1);
}
</style>
