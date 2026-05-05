<template>
  <div class="nutrition-calculator">
    <v-card class="pa-6" rounded="xl">
      <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
        <div>
          <h2 class="text-h6 mb-1">Kaloriju aprēķins</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            USDA FoodData Central dati tiek izmantoti sastāvdaļu enerģētiskās vērtības noteikšanai.
          </p>
        </div>
        <v-btn
          color="primary"
          variant="tonal"
          :loading="loading"
          :disabled="!gramReadyIngredients.length"
          @click="calculateCalories"
        >
          Pārrēķināt
        </v-btn>
      </div>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
        {{ error }}
      </v-alert>

      <v-alert v-else-if="skippedIngredients.length" type="info" variant="tonal" class="mb-4">
        Aprēķinā tiek iekļautas tikai sastāvdaļas ar norādītu daudzumu gramos.
      </v-alert>

      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="56" class="mb-3" />
        <p class="text-body-1 mb-0">Notiek kaloriju aprēķins...</p>
      </div>

      <template v-else>
        <v-alert v-if="!normalizedIngredients.length" type="info" variant="tonal">
          Pievienojiet vismaz vienu sastāvdaļu, lai aprēķinātu kalorijas.
        </v-alert>

        <v-alert v-else-if="!gramReadyIngredients.length" type="info" variant="tonal">
          Lai aprēķins darbotos, katrai sastāvdaļai norādiet daudzumu gramos.
        </v-alert>

        <div v-else class="nutrition-content">
          <div class="ingredients-section mb-6">
            <h3 class="text-subtitle-1 font-weight-medium mb-3">Sastāvdaļas</h3>

            <v-row class="gy-3">
              <v-col v-for="ingredient in displayIngredients" :key="ingredient.key" cols="12">
                <v-card class="pa-4 ingredient-card" variant="outlined">
                  <v-row align="center" class="gy-2">
                    <v-col cols="12" md="4">
                      <p class="text-body-2 text-medium-emphasis mb-1">Nosaukums</p>
                      <p class="text-body-1 font-weight-medium mb-0">{{ ingredient.name }}</p>
                      <p v-if="ingredient.matched_food" class="text-caption text-medium-emphasis mt-1 mb-0">
                        USDA: {{ ingredient.matched_food }}
                      </p>
                    </v-col>

                    <v-col cols="6" md="3">
                      <p class="text-body-2 text-medium-emphasis mb-1">Daudzums</p>
                      <p class="text-body-1 font-weight-medium mb-0">{{ ingredient.quantity }} g</p>
                    </v-col>

                    <v-col cols="6" md="2">
                      <p class="text-body-2 text-medium-emphasis mb-1">Uz 100 g</p>
                      <p class="text-body-1 font-weight-medium mb-0">
                        {{ ingredient.caloriesPer100gLabel }}
                      </p>
                    </v-col>

                    <v-col cols="12" md="3" class="text-md-right">
                      <p class="text-body-2 text-medium-emphasis mb-1">Kopā</p>
                      <p
                        class="text-h6 font-weight-bold mb-0"
                        :class="ingredient.found ? 'text-primary' : 'text-medium-emphasis'"
                      >
                        {{ ingredient.caloriesLabel }}
                      </p>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <v-card v-if="totalCalories > 0" class="pa-6 total-calories" rounded="xl">
            <div class="text-center">
              <p class="text-subtitle-1 text-white mb-2">Kopējā recepšu kaloriju vērtība</p>
              <p class="text-h3 font-weight-bold text-white mb-3">{{ totalCalories }} kcal</p>

              <v-divider class="my-4 opacity-50" />

              <p class="text-body-2 text-white mb-2">Kalorijas vienā porcijā</p>
              <v-text-field
                v-model.number="servings"
                type="number"
                variant="outlined"
                label="Porciju skaits"
                min="1"
                density="compact"
                class="servings-input mx-auto"
                style="max-width: 170px"
              />
              <p class="text-h5 font-weight-bold text-white mt-2 mb-0">
                {{ caloriesPerServing }} kcal / porcija
              </p>
            </div>
          </v-card>
        </div>
      </template>
    </v-card>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { api } from '../api'

const props = defineProps({
  ingredients: {
    type: Array,
    required: true,
  },
  autoCalculate: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:calories'])

const loading = ref(false)
const error = ref('')
const totalCalories = ref(0)
const servings = ref(1)
const calculatedIngredients = ref([])

let recalculateTimer = null
let requestId = 0

const caloriesPerServing = computed(() => {
  const portionCount = Number(servings.value)
  if (!Number.isFinite(portionCount) || portionCount <= 0) {
    return 0
  }

  return Math.round((totalCalories.value / portionCount) * 100) / 100
})

const normalizedIngredients = computed(() =>
  props.ingredients
    .map((item, index) => {
      const rawName = String(item?.name ?? '').trim()
      const rawQuantity = item?.quantity ?? item?.amount ?? ''
      const quantity = Number.parseFloat(String(rawQuantity).replace(',', '.'))
      const unit = String(item?.unit ?? 'g').trim()

      return {
        key: `${index}-${rawName}`,
        name: rawName,
        quantity: Number.isFinite(quantity) ? quantity : null,
        unit,
      }
    })
    .filter((item) => item.name)
)

const gramReadyIngredients = computed(() =>
  normalizedIngredients.value.filter(
    (item) => Number.isFinite(item.quantity) && item.quantity > 0 && isGramUnit(item.unit)
  )
)

const skippedIngredients = computed(() =>
  normalizedIngredients.value.filter(
    (item) => !Number.isFinite(item.quantity) || item.quantity <= 0 || !isGramUnit(item.unit)
  )
)

const displayIngredients = computed(() => {
  if (calculatedIngredients.value.length) {
    return calculatedIngredients.value.map((ingredient, index) => ({
      key: `${index}-${ingredient.name}`,
      name: ingredient.name,
      quantity: formatNumber(ingredient.quantity),
      matched_food: ingredient.matched_food,
      found: Boolean(ingredient.found),
      caloriesPer100gLabel: ingredient.found
        ? `${formatNumber(ingredient.calories_per_100g)} kcal`
        : 'Nav atrasts',
      caloriesLabel: ingredient.found
        ? `${formatNumber(ingredient.calories)} kcal`
        : 'Nav atrasts',
    }))
  }

  return gramReadyIngredients.value.map((ingredient) => ({
    key: ingredient.key,
    name: ingredient.name,
    quantity: formatNumber(ingredient.quantity),
    matched_food: null,
    found: false,
    caloriesPer100gLabel: 'Gaida aprēķinu',
    caloriesLabel: 'Gaida aprēķinu',
  }))
})

function isGramUnit(unit) {
  const normalizedUnit = String(unit || '')
    .trim()
    .toLowerCase()

  return normalizedUnit === '' || ['g', 'gr', 'gram', 'grams', 'gramm', 'grammi', 'gramms', 'г', 'гр'].includes(normalizedUnit)
}

function formatNumber(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return '0'
  }

  return Number.isInteger(numericValue)
    ? String(numericValue)
    : numericValue.toFixed(2).replace(/\.?0+$/, '')
}

function resetCalculatedState() {
  totalCalories.value = 0
  calculatedIngredients.value = []
  error.value = ''
  emit('update:calories', 0)
}

async function calculateCalories() {
  if (!gramReadyIngredients.value.length) {
    resetCalculatedState()
    if (normalizedIngredients.value.length) {
      error.value = 'Kaloriju aprēķinam norādiet sastāvdaļu daudzumu gramos.'
    }
    return
  }

  const currentRequestId = ++requestId
  loading.value = true
  error.value = ''

  try {
    const response = await api.post('/nutrition/calculate-recipe', {
      ingredients: gramReadyIngredients.value.map((ingredient) => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
      })),
    })

    if (currentRequestId !== requestId) {
      return
    }

    const payload = response.data?.data
    totalCalories.value = Number(payload?.totalCalories || 0)
    calculatedIngredients.value = Array.isArray(payload?.ingredients) ? payload.ingredients : []
    emit('update:calories', totalCalories.value)
  } catch (err) {
    if (currentRequestId !== requestId) {
      return
    }

    resetCalculatedState()
    error.value = err?.response?.data?.message || 'Neizdevās aprēķināt kalorijas.'
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false
    }
  }
}

function scheduleRecalculation() {
  if (recalculateTimer) {
    clearTimeout(recalculateTimer)
  }

  if (!props.autoCalculate) {
    return
  }

  if (!normalizedIngredients.value.length) {
    resetCalculatedState()
    return
  }

  recalculateTimer = setTimeout(() => {
    calculateCalories()
  }, 500)
}

watch(
  () => props.ingredients,
  () => {
    scheduleRecalculation()
  },
  { deep: true, immediate: true }
)

watch(servings, (value) => {
  if (!Number.isFinite(Number(value)) || Number(value) < 1) {
    servings.value = 1
  }
})

onBeforeUnmount(() => {
  if (recalculateTimer) {
    clearTimeout(recalculateTimer)
  }
})
</script>

<style scoped>
.nutrition-calculator {
  width: 100%;
}

.ingredient-card {
  background: rgba(var(--v-theme-surface), 0.9) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08) !important;
}

.total-calories {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.84)) !important;
}

.servings-input {
  --v-field-padding-top: 8px;
  --v-field-padding-bottom: 8px;
}

:deep(.v-theme--dark) .ingredient-card {
  background: rgba(36, 32, 29, 0.8) !important;
}
</style>
