<template>
  <v-container class="py-6" style="max-width: 1200px;">
    <v-row class="gy-6">
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-title class="d-flex align-center ga-2 py-5">
            <v-icon icon="mdi-folder-plus-outline" color="primary" />
            <span class="text-h6">Izveidot kolekciju</span>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-alert v-if="error" type="error" variant="tonal" class="mb-4" rounded="lg">
              {{ error }}
            </v-alert>
            <v-form @submit.prevent="createCollection">
              <v-row class="gy-4">
                <v-col cols="12" md="8">
                  <v-text-field v-model="newName" label="Kolekcijas nosaukums" required />
                </v-col>
                <v-col cols="12" md="4" class="d-flex align-end">
                  <v-btn type="submit" color="primary" variant="flat" :loading="creating" block>
                    Izveidot
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-title class="d-flex align-center ga-2 py-5">
            <v-icon icon="mdi-folder-outline" color="primary" />
            <span class="text-h6">Manas kolekcijas</span>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-row v-if="loading" class="gy-4">
              <v-col v-for="n in 4" :key="`collection-skel-${n}`" cols="12">
                <v-skeleton-loader type="card" />
              </v-col>
            </v-row>
            <v-alert v-else-if="collections.length === 0" type="info" variant="tonal" rounded="lg">
              Kolekciju vēl nav.
            </v-alert>
            <v-expansion-panels v-else>
              <v-expansion-panel v-for="collection in collections" :key="collection.id" rounded="xl" class="mb-4 elevation-0">
                <v-expansion-panel-title>
                  <div class="d-flex align-center justify-space-between w-100 pe-2">
                    <div class="d-flex align-center ga-2">
                      <v-icon icon="mdi-folder" />
                      <span>{{ collection.name }}</span>
                    </div>
                    <v-btn
                      size="small"
                      variant="tonal"
                      color="error"
                      @click.stop="removeCollection(collection.id)"
                    >
                      Dzēst
                    </v-btn>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="d-flex flex-wrap ga-2">
                    <v-chip
                      v-for="recipe in collection.recipes"
                      :key="recipe.id"
                      closable
                      size="small"
                      color="primary"
                      variant="tonal"
                      @click:close="removeRecipe(collection.id, recipe.id)"
                    >
                      {{ recipe.title }}
                    </v-chip>
                  </div>
                  <v-alert v-if="collection.recipes.length === 0" type="info" variant="tonal" class="mt-3" rounded="lg">
                    Šajā kolekcijā vēl nav recepšu.
                  </v-alert>

                  <v-divider class="my-4" />

                  <v-form @submit.prevent="addRecipe(collection.id)">
                    <v-row class="align-end">
                      <v-col cols="12" md="8">
                        <v-select
                          v-model="recipeToAdd[collection.id]"
                          :items="availableRecipes"
                          item-title="title"
                          item-value="id"
                          label="Recepte pievienošanai"
                          clearable
                        />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-btn
                          type="submit"
                          size="small"
                          color="primary"
                          variant="flat"
                          block
                          :disabled="!recipeToAdd[collection.id]"
                        >
                          Pievienot
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { api } from '../api'

const loading = ref(false)
const creating = ref(false)
const error = ref('')

const collections = ref([])
const availableRecipes = ref([])
const newName = ref('')
const recipeToAdd = reactive({})

async function loadCollections() {
  loading.value = true
  try {
    const res = await api.get('/collections')
    const data = res.data?.data || res.data || []
    collections.value = Array.isArray(data) ? data : []
  } finally {
    loading.value = false
  }
}

async function loadAvailableRecipes() {
  try {
    const res = await api.get('/recipes', { params: { per_page: 100, sort: 'newest' } })
    availableRecipes.value = res.data?.data || []
  } catch {
    availableRecipes.value = []
  }
}

async function createCollection() {
  const name = newName.value.trim()
  if (!name) return
  error.value = ''
  creating.value = true
  try {
    await api.post('/collections', { name })
    newName.value = ''
    await loadCollections()
  } catch (e) {
    error.value = e?.response?.data?.message || 'Neizdevās izveidot kolekciju.'
  } finally {
    creating.value = false
  }
}

async function removeCollection(collectionId) {
  const ok = window.confirm('Vai tiešām dzēst šo kolekciju?')
  if (!ok) return
  error.value = ''
  try {
    await api.delete(`/collections/${collectionId}`)
    collections.value = collections.value.filter((item) => item.id !== collectionId)
  } catch (e) {
    error.value = e?.response?.data?.message || 'Neizdevās dzēst kolekciju.'
  }
}

async function addRecipe(collectionId) {
  const recipeId = Number(recipeToAdd[collectionId])
  if (!recipeId) return
  error.value = ''
  try {
    await api.post(`/collections/${collectionId}/recipes/${recipeId}`)
    recipeToAdd[collectionId] = null
    await loadCollections()
  } catch (e) {
    error.value = e?.response?.data?.message || 'Neizdevās pievienot recepti.'
  }
}

async function removeRecipe(collectionId, recipeId) {
  error.value = ''
  try {
    await api.delete(`/collections/${collectionId}/recipes/${recipeId}`)
    await loadCollections()
  } catch (e) {
    error.value = e?.response?.data?.message || 'Neizdevās noņemt recepti.'
  }
}

onMounted(async () => {
  await Promise.all([loadCollections(), loadAvailableRecipes()])
})
</script>
