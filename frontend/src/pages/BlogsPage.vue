<template>
  <v-container class="py-6 blogs-page">
    <v-card rounded="xl" class="hero-card soft-container soft-section" variant="flat">
      <div class="d-flex flex-wrap justify-space-between align-center ga-3">
        <div>
          <h1 class="text-h4 mb-1">Kulinārijas blogs</h1>
          <p class="text-body-1 text-medium-emphasis mb-0">
            Raksti, stāsti un ieteikumi kulinārijas entuziastiem.
          </p>
        </div>
        <v-btn
          color="primary"
          variant="flat"
          class="pill-btn"
          prepend-icon="mdi-pencil-plus"
          :disabled="!canCreate"
          @click="openCreateDialog"
        >
          + Rakstīt rakstu
        </v-btn>
      </div>
    </v-card>

    <v-row class="align-start" dense>
      <v-col cols="12" md="3">
        <v-card rounded="xl" class="soft-container mb-5 sidebar-card" variant="flat">
          <h2 class="text-subtitle-1 mb-4">Filtri</h2>
          <v-select
            v-model="filters.category"
            :items="categoryOptions"
            label="Kategorija"
            density="comfortable"
          />
          <v-select
            v-model="filters.sort"
            :items="sortOptions"
            label="Kārtot pēc"
            density="comfortable"
          />
          <v-btn color="primary" block class="pill-btn" @click="applyFilters">Pielietot</v-btn>
        </v-card>

        <div class="d-flex flex-column ga-4">
          <v-card class="metric-card" variant="flat">
            <div class="text-body-2 text-medium-emphasis">Kopā raksti</div>
            <div class="text-h5 font-weight-bold">{{ stats.total }}</div>
          </v-card>
          <v-card class="metric-card" variant="flat">
            <div class="text-body-2 text-medium-emphasis">Kopā skatījumi</div>
            <div class="text-h5 font-weight-bold">{{ stats.views }}</div>
          </v-card>
          <v-card class="metric-card" variant="flat">
            <div class="text-body-2 text-medium-emphasis">Komentāri</div>
            <div class="text-h5 font-weight-bold">{{ stats.comments }}</div>
          </v-card>
        </div>
      </v-col>

      <v-col cols="12" md="9">
        <v-card rounded="xl" class="soft-container" variant="flat">
          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">{{ errorMessage }}</v-alert>

          <v-row v-if="posts.length" dense class="ga-md-2">
            <v-col v-for="(post, index) in posts" :key="post.id" cols="12">
              <v-card class="post-card" :class="{ 'post-featured': index === 0 }" variant="flat">
                <div class="d-flex flex-wrap align-start justify-space-between ga-3">
                  <div class="post-main">
                    <button type="button" class="post-title-btn text-h6 mb-2" @click="openPost(post.id)">
                      {{ post.title }}
                    </button>
                    <div class="text-body-2 text-medium-emphasis mb-3">{{ post.excerpt }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ post.author_name }} • {{ formatDate(post.created_at) }} • {{ post.category || 'Blogs' }}
                    </div>
                    <v-btn
                      size="small"
                      variant="tonal"
                      class="pill-btn mt-3"
                      @click="openPost(post.id)"
                    >
                      Lasīt vairāk
                    </v-btn>
                  </div>
                  <v-chip size="small" variant="flat" color="primary" class="category-tag">{{ post.category || 'Blogs' }}</v-chip>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-alert v-else type="info" variant="tonal">Raksti nav pieejami.</v-alert>

          <div class="d-flex justify-center mt-5">
            <v-btn variant="tonal" class="pill-btn" :disabled="!hasMore" @click="loadMore">
              Ielādēt vairāk rakstus
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="createDialog" max-width="700">
      <v-card>
        <v-card-title>Jauns blogs</v-card-title>
        <v-card-text>
          <v-text-field v-model="createForm.title" label="Virsraksts" />
          <v-text-field v-model="createForm.category" label="Kategorija" />
          <v-textarea v-model="createForm.excerpt" label="Īss apraksts" rows="2" />
          <v-textarea v-model="createForm.content" label="Saturs" rows="5" />
          <ImageSourceInput
            v-model:url="createForm.image_url"
            v-model:file="createForm.image"
            v-model:mode="createForm.image_mode"
            title="Bloga attēls"
            hint="Varat izmantot failu vai URL. Augšupielādes kļūdas tiek validētas pirms nosūtīšanas."
            @validation="handleImageValidation"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="createDialog = false">Atcelt</v-btn>
          <v-btn color="primary" :loading="submitting" @click="submitPost">Publicēt</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2600">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import ImageSourceInput from '../components/ImageSourceInput.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const posts = ref([])
const errorMessage = ref('')
const createDialog = ref(false)
const submitting = ref(false)
const page = ref(1)
const lastPage = ref(1)
const imageValidation = ref({ isValid: true, urlErrors: [], fileErrors: [] })

const filters = reactive({
  category: '',
  sort: 'newest',
})

const stats = reactive({
  total: 0,
  views: 0,
  comments: 0,
})

const createForm = reactive({
  title: '',
  excerpt: '',
  content: '',
  image_url: '',
  image: null,
  image_mode: 'file',
  category: 'Padomi',
})

const snackbar = reactive({
  show: false,
  text: '',
  color: 'success',
})

const categoryOptions = ['Padomi', 'Receptes', 'Produktu apskati', 'Intervijas']
const sortOptions = [
  { title: 'Jaunākie', value: 'newest' },
  { title: 'Vecākie', value: 'oldest' },
]

const canCreate = computed(() => auth.isAuthenticated)
const hasMore = computed(() => page.value < lastPage.value)

function showSnackbar(text, color = 'success') {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

function formatDate(value) {
  if (!value) return 'Datums nav pieejams'
  return new Date(value).toLocaleDateString('lv-LV')
}

function handleImageValidation(payload) {
  imageValidation.value = payload
}

function getSelectedImage() {
  return Array.isArray(createForm.image) ? createForm.image[0] : createForm.image
}

async function fetchPosts(reset = false) {
  errorMessage.value = ''
  try {
    const params = {
      page: page.value,
      sort: filters.sort,
      category: filters.category || undefined,
    }
    const res = await api.get('/blog-posts', { params })
    const payload = res.data || {}
    const rows = Array.isArray(payload.data) ? payload.data : []

    posts.value = reset ? rows : [...posts.value, ...rows]
    lastPage.value = Number(payload.meta?.last_page || payload.last_page || 1)

    stats.total = Number(payload.meta?.total || posts.value.length || 0)
    stats.views = posts.value.reduce((sum, item) => sum + Number(item.views_count || 0), 0)
    stats.comments = posts.value.reduce((sum, item) => sum + Number(item.comments_count || 0), 0)
  } catch (err) {
    errorMessage.value = err?.response?.data?.message || 'Neizdevās ielādēt bloga rakstus.'
  }
}

function applyFilters() {
  page.value = 1
  fetchPosts(true)
}

function loadMore() {
  if (!hasMore.value) return
  page.value += 1
  fetchPosts(false)
}

function openPost(id) {
  router.push({ name: 'blogRead', params: { id } })
}

function openCreateDialog() {
  if (!canCreate.value) {
    showSnackbar('Lai pievienotu rakstu, vispirms autorizējieties.', 'warning')
    return
  }
  imageValidation.value = { isValid: true, urlErrors: [], fileErrors: [] }
  createDialog.value = true
}

async function submitPost() {
  if (!createForm.title.trim() || !createForm.excerpt.trim() || !createForm.content.trim()) {
    showSnackbar('Lūdzu, aizpildiet obligātos laukus.', 'error')
    return
  }
  if (!imageValidation.value.isValid) {
    showSnackbar([...imageValidation.value.urlErrors, ...imageValidation.value.fileErrors][0] || 'Attēls nav derīgs.', 'error')
    return
  }

  submitting.value = true
  try {
    const selectedImage = getSelectedImage()
    const basePayload = {
      title: createForm.title.trim(),
      excerpt: createForm.excerpt.trim(),
      content: createForm.content.trim(),
      category: createForm.category.trim() || null,
      image_url: createForm.image_mode === 'url' ? (createForm.image_url.trim() || null) : undefined,
    }

    let payload = basePayload

    if (createForm.image_mode === 'file' && selectedImage instanceof File) {
      payload = new FormData()
      payload.append('title', basePayload.title)
      payload.append('excerpt', basePayload.excerpt)
      payload.append('content', basePayload.content)
      payload.append('category', basePayload.category || '')
      payload.append('image', selectedImage)
    }

    await api.post('/blog-posts', payload)

    createDialog.value = false
    createForm.title = ''
    createForm.excerpt = ''
    createForm.content = ''
    createForm.image_url = ''
    createForm.image = null
    createForm.image_mode = 'file'
    createForm.category = 'Padomi'
    imageValidation.value = { isValid: true, urlErrors: [], fileErrors: [] }

    page.value = 1
    await fetchPosts(true)
    await auth.fetchMe()
    showSnackbar('Raksts veiksmīgi publicēts.')
  } catch (err) {
    showSnackbar(err?.response?.data?.message || 'Neizdevās publicēt rakstu.', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchPosts(true)
})
</script>

<style scoped>
.blogs-page {
  max-width: 1180px;
}

.hero-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: rgb(var(--v-theme-surface));
}

.sidebar-card,
.metric-card,
.post-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.metric-card {
  padding: 18px;
}

.post-card {
  padding: 24px;
}

.post-featured {
  padding: 30px;
}

.post-main {
  max-width: 85%;
}

.post-title-btn {
  background: transparent;
  border: 0;
  padding: 0;
  text-align: left;
  cursor: pointer;
  color: inherit;
  font-weight: 700;
}

.post-title-btn:hover {
  color: rgb(var(--v-theme-primary));
}

.category-tag,
.pill-btn {
  border-radius: 999px;
}

.post-card:hover,
.metric-card:hover,
.sidebar-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
}

:deep(.v-theme--dark) .hero-card {
  background: #24201D;
}

:deep(.v-theme--dark) .post-main {
  max-width: 80%;
}

@media (max-width: 960px) {
  .post-main {
    max-width: 100%;
  }

  .post-featured {
    padding: 24px;
  }
}
</style>

