<template>
  <v-container class="page-container py-6">
    <v-card rounded="xl" class="soft-shell pa-6 mb-6">
      <div class="d-flex flex-wrap align-center justify-space-between ga-3">
        <div>
          <h1 class="text-h5 mb-1">Admina panelis</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Lietotāju, komentāru un platformas statistikas pārvaldība.
          </p>
        </div>
        <v-btn color="primary" class="pill-btn" @click="refreshAll">
          <v-icon icon="mdi-refresh" start />
          Atjaunot datus
        </v-btn>
      </div>
    </v-card>

    <v-row class="mb-1" dense>
      <v-col v-for="item in statItems" :key="item.key" cols="12" sm="6" lg="3">
        <v-card rounded="xl" class="metric-card h-100" variant="flat">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-caption text-medium-emphasis">{{ item.label }}</span>
            <v-icon :icon="item.icon" color="primary" />
          </div>
          <div class="text-h5 font-weight-bold">{{ item.value }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" lg="6">
        <v-card rounded="xl" class="soft-shell pa-5 h-100">
          <div class="d-flex align-center justify-space-between ga-3 mb-4">
            <h2 class="text-h6 mb-0">Lietotāji</h2>
            <v-text-field
              v-model="userQuery"
              label="Meklēt lietotāju"
              hide-details
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              style="max-width: 260px;"
            />
          </div>

          <Loader v-if="usersLoading" />
          <v-list v-else-if="users.length" lines="two">
            <v-list-item v-for="user in users" :key="user.id" class="admin-row">
              <v-list-item-title>{{ user.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ user.email }} • {{ roleLabel(user.role) }}
                <template v-if="user.assigned_role && user.assigned_role !== user.role">
                  • piešķirtā loma: {{ roleLabel(user.assigned_role) }}
                </template>
              </v-list-item-subtitle>

              <template #append>
                <v-select
                  :items="roleOptions"
                  item-title="label"
                  item-value="value"
                  :model-value="user.assigned_role || user.role"
                  density="compact"
                  style="width: 150px;"
                  @update:modelValue="(value) => updateRole(user, value)"
                />
              </template>
            </v-list-item>
          </v-list>
          <v-alert v-else type="info" variant="tonal">Lietotāji netika atrasti.</v-alert>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card rounded="xl" class="soft-shell pa-5 h-100">
          <div class="d-flex align-center justify-space-between ga-3 mb-4">
            <h2 class="text-h6 mb-0">Komentāru moderācija</h2>
            <v-text-field
              v-model="commentQuery"
              label="Meklēt komentāru"
              hide-details
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              style="max-width: 260px;"
            />
          </div>

          <Loader v-if="commentsLoading" />
          <v-list v-else-if="comments.length" lines="two">
            <v-list-item v-for="comment in comments" :key="comment.id" class="admin-row">
              <v-list-item-title>{{ comment.user?.name || 'Lietotājs' }}</v-list-item-title>
              <v-list-item-subtitle>{{ comment.text }}</v-list-item-subtitle>
              <template #append>
                <v-btn icon variant="text" color="error" @click="removeComment(comment)">
                  <v-icon icon="mdi-delete-outline" />
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
          <v-alert v-else type="info" variant="tonal">Komentāri netika atrasti.</v-alert>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2200">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { api } from '../api'
import Loader from '../components/Loader.vue'

const stats = ref({})
const users = ref([])
const comments = ref([])
const usersLoading = ref(false)
const commentsLoading = ref(false)
const userQuery = ref('')
const commentQuery = ref('')

const snackbar = reactive({
  show: false,
  text: '',
  color: 'success',
})

const roleOptions = [
  { label: 'Lietotājs', value: 'user' },
  { label: 'Autors', value: 'author' },
  { label: 'Administrators', value: 'admin' },
]

const statItems = computed(() => ([
  {
    key: 'users_count',
    label: 'Lietotāji',
    value: Number(stats.value.users_count || 0),
    icon: 'mdi-account-group-outline',
  },
  {
    key: 'recipes_count',
    label: 'Receptes',
    value: Number(stats.value.recipes_count || 0),
    icon: 'mdi-silverware-fork-knife',
  },
  {
    key: 'comments_count',
    label: 'Komentāri',
    value: Number(stats.value.comments_count || 0),
    icon: 'mdi-comment-multiple-outline',
  },
  {
    key: 'ratings_count',
    label: 'Vērtējumi',
    value: Number(stats.value.ratings_count || 0),
    icon: 'mdi-star-outline',
  },
  {
    key: 'favorites_count',
    label: 'Favorīti',
    value: Number(stats.value.favorites_count || 0),
    icon: 'mdi-heart-outline',
  },
  {
    key: 'collections_count',
    label: 'Kolekcijas',
    value: Number(stats.value.collections_count || 0),
    icon: 'mdi-folder-multiple-outline',
  },
  {
    key: 'ingredients_count',
    label: 'Sastāvdaļas',
    value: Number(stats.value.ingredients_count || 0),
    icon: 'mdi-carrot',
  },
]))

let userSearchTimer = null
let commentSearchTimer = null

function showSnackbar(text, color = 'success') {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

function roleLabel(role) {
  const found = roleOptions.find((item) => item.value === role)
  return found?.label || role
}

async function loadStats() {
  const res = await api.get('/admin/analytics')
  stats.value = res.data?.stats || {}
}

async function loadUsers() {
  usersLoading.value = true
  try {
    const res = await api.get('/admin/users', { params: { q: userQuery.value } })
    users.value = res.data?.data || []
  } finally {
    usersLoading.value = false
  }
}

async function loadComments() {
  commentsLoading.value = true
  try {
    const res = await api.get('/admin/comments', { params: { q: commentQuery.value } })
    comments.value = res.data?.data || []
  } finally {
    commentsLoading.value = false
  }
}

async function updateRole(user, role) {
  const previousRole = user.role
  const previousAssignedRole = user.assigned_role || user.role
  try {
    const res = await api.patch(`/admin/users/${user.id}/role`, { role })
    user.role = res.data?.user?.role || role
    user.assigned_role = res.data?.user?.assigned_role || role
    showSnackbar(`Loma lietotājam ${user.name} atjaunota.`)
  } catch (err) {
    user.role = previousRole
    user.assigned_role = previousAssignedRole
    showSnackbar(err?.response?.data?.message || 'Neizdevās atjaunot lietotāja lomu.', 'error')
  }
}

async function removeComment(comment) {
  try {
    await api.delete(`/admin/comments/${comment.id}`)
    comments.value = comments.value.filter((item) => item.id !== comment.id)
    showSnackbar('Komentārs dzēsts.')
  } catch {
    showSnackbar('Neizdevās dzēst komentāru.', 'error')
  }
}

async function refreshAll() {
  try {
    await Promise.all([loadStats(), loadUsers(), loadComments()])
    showSnackbar('Dati atjaunoti.')
  } catch {
    showSnackbar('Neizdevās ielādēt admina datus.', 'error')
  }
}

watch(userQuery, () => {
  if (userSearchTimer) {
    clearTimeout(userSearchTimer)
  }
  userSearchTimer = setTimeout(() => {
    loadUsers()
  }, 250)
})

watch(commentQuery, () => {
  if (commentSearchTimer) {
    clearTimeout(commentSearchTimer)
  }
  commentSearchTimer = setTimeout(() => {
    loadComments()
  }, 250)
})

onMounted(() => {
  refreshAll()
})
</script>

<style scoped>
.page-container {
  max-width: 1240px;
}

.soft-shell {
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.metric-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
  padding: 20px;
}

.admin-row {
  border-radius: 12px;
}

.admin-row:hover {
  background: rgba(var(--v-theme-primary), 0.08);
}

.pill-btn {
  border-radius: 999px;
}
</style>
