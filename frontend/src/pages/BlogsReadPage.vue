<template>
  <v-container class="py-6 blogs-read-page">
    <v-btn variant="text" class="mb-4" prepend-icon="mdi-arrow-left" :to="{ name: 'blogs' }">
      Atpakaļ uz blogu
    </v-btn>

    <v-card v-if="loading" rounded="xl" class="pa-6 read-shell" variant="flat">
      <v-skeleton-loader type="heading, text, text, image, article, article" />
    </v-card>

    <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </v-alert>

    <v-card v-else-if="post" rounded="xl" class="pa-6 read-shell" variant="flat">
      <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-3">
        <v-chip color="primary" variant="tonal" size="small">{{ post.category || 'Blogs' }}</v-chip>
        <div class="d-flex flex-wrap ga-2">
          <v-chip size="small" variant="tonal">Skatījumi: {{ post.views_count || 0 }}</v-chip>
          <v-chip size="small" variant="tonal">Komentāri: {{ post.comments_count || 0 }}</v-chip>
        </div>
      </div>

      <h1 class="text-h4 mb-2">{{ post.title }}</h1>
      <div class="text-body-2 text-medium-emphasis mb-5">
        {{ post.author_name }} • {{ formatDate(post.created_at) }}
      </div>

      <v-img
        v-if="post.image_url"
        :src="post.image_url"
        height="320"
        cover
        rounded="lg"
        class="mb-5"
      />

      <article class="post-content">
        <p v-for="(paragraph, index) in contentParagraphs" :key="index">
          {{ paragraph }}
        </p>
      </article>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api'

const route = useRoute()
const loading = ref(false)
const error = ref('')
const post = ref(null)

const contentParagraphs = computed(() => {
  const text = String(post.value?.content || '')
  return text
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
})

function formatDate(value) {
  if (!value) return 'Datums nav pieejams'
  return new Date(value).toLocaleDateString('lv-LV')
}

async function loadPost() {
  loading.value = true
  error.value = ''
  post.value = null

  try {
    const res = await api.get(`/blog-posts/${route.params.id}`)
    post.value = res.data?.blog_post || res.data?.data || null
    if (!post.value) {
      error.value = 'Neizdevās ielādēt rakstu.'
    }
  } catch (err) {
    error.value = err?.response?.data?.message || 'Neizdevās ielādēt rakstu.'
  } finally {
    loading.value = false
  }
}

onMounted(loadPost)
</script>

<style scoped>
.blogs-read-page {
  max-width: 980px;
}

.read-shell {
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.post-content {
  font-size: 1.03rem;
  line-height: 1.7;
  color: rgba(var(--v-theme-on-surface), 0.95);
}

.post-content p {
  margin-bottom: 1rem;
}
</style>
