<template>
  <v-container class="py-6 profile-page">
    <v-alert v-if="!auth.isAuthenticated" type="info" variant="tonal" class="mb-4">
      Lai skatītu profilu, lūdzu, autorizējieties.
      <template #append>
        <v-btn size="small" :to="{ name: 'login' }">Ieiet</v-btn>
      </template>
    </v-alert>

    <template v-else>
      <v-card rounded="xl" class="profile-hero pa-8 mb-8">
        <div class="d-flex flex-wrap align-center justify-space-between ga-4">
          <div class="d-flex align-center ga-4">
            <v-avatar size="84" class="profile-avatar">
              <template v-if="avatarPreview">
                <v-img :src="avatarPreview" />
              </template>
              <template v-else>
                {{ profileInitial }}
              </template>
            </v-avatar>
            <div>
              <div class="text-overline hero-eyebrow">Mans profils</div>
              <h1 class="text-h4 mb-1">{{ auth.user?.name }}</h1>
              <div class="d-flex align-center ga-2 flex-wrap">
                <v-chip size="small" color="primary" variant="flat" class="role-badge">{{ roleLabel }}</v-chip>
                <span class="text-body-2 text-medium-emphasis">{{ auth.user?.email }}</span>
              </div>
            </div>
          </div>
          <div class="d-flex flex-wrap ga-2">
            <v-btn color="primary" variant="flat" class="pill-btn" @click="openSettingsTab">Rediģēt profilu</v-btn>
            <v-btn variant="tonal" class="pill-btn" @click="openMessages">Ziņojumi</v-btn>
          </div>
        </div>

        <v-progress-linear
          v-if="isLoadingProfile"
          indeterminate
          color="primary"
          class="mt-6"
          rounded
        />
      </v-card>

      <v-alert v-if="profileLoadError" type="error" variant="tonal" class="mb-6">
        {{ profileLoadError }}
      </v-alert>

      <v-row class="mb-8" dense>
        <v-col v-for="item in statsCards" :key="item.key" cols="12" sm="6" md="3">
          <v-card rounded="xl" variant="flat" class="pa-5 stat-card" :class="{ 'stat-highlight': item.highlight }">
            <div class="d-flex align-center justify-space-between ga-3 mb-3">
              <div class="text-body-2 text-medium-emphasis">{{ item.label }}</div>
              <div class="stat-card__icon">
                <v-icon :icon="item.icon" size="20" />
              </div>
            </div>
            <div class="text-h5 font-weight-bold mb-1">{{ item.value }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.caption }}</div>
          </v-card>
        </v-col>
      </v-row>

      <v-card rounded="xl" class="pa-5 mb-8 achievements-preview" variant="flat">
        <div class="d-flex flex-wrap align-center justify-space-between ga-4">
          <div>
            <div class="text-overline section-eyebrow">Sasniegumi</div>
            <h2 class="text-h6 mb-1">Sasniegumu progress</h2>
            <p class="text-body-2 text-medium-emphasis achievement-preview-copy">
              Dinamiska sistēma, kas balstīta uz tavu aktivitāti platformā.
            </p>
          </div>

          <div class="d-flex flex-wrap align-center ga-3">
            <div class="achievement-summary">
              <div class="achievement-summary__pill">
                <span>Atbloķēti</span>
                <strong>{{ achievementSummary.unlocked_count }} / {{ achievementSummary.total_count }}</strong>
              </div>
              <div class="achievement-summary__pill achievement-summary__pill--accent">
                <span>Kopējais progress</span>
                <strong>{{ achievementSummary.completion_percentage }}%</strong>
              </div>
            </div>
            <v-btn color="primary" variant="tonal" class="pill-btn" @click="openAchievementsTab">
              Skatīt sasniegumus
            </v-btn>
          </div>
        </div>

        <div class="achievement-preview-strip mt-4">
          <div
            v-for="achievement in previewAchievements"
            :key="achievement.key"
            class="achievement-preview-pill"
            :class="{ 'achievement-preview-pill--locked': !achievement.is_unlocked }"
          >
            <v-icon :icon="achievement.icon" size="18" />
            <span>{{ achievement.title }}</span>
            <strong>{{ achievement.current_tier.label }}</strong>
          </div>
        </div>
      </v-card>

      <v-card ref="tabsCardRef" rounded="xl" class="profile-tabs-wrap" variant="flat">
        <v-tabs v-model="selectedTab" color="primary" align-tabs="start" class="profile-tabs px-4 pt-2">
          <v-tab value="recipes">Manas receptes</v-tab>
          <v-tab value="achievements">Sasniegumi</v-tab>
          <v-tab value="favorites">Izlases saraksts</v-tab>
          <v-tab value="comments">Mani komentāri</v-tab>
          <v-tab value="settings">Iestatījumi</v-tab>
        </v-tabs>

        <v-divider />

        <v-window v-model="selectedTab">
          <v-window-item value="recipes">
            <div class="pa-5">
              <v-row v-if="ownRecipes.length" class="gy-4">
                <v-col v-for="recipe in ownRecipes" :key="recipe.id" cols="12" md="6">
                  <v-card class="pa-5 recipe-card" variant="flat">
                    <div class="text-subtitle-1 font-weight-medium mb-1">{{ recipe.title }}</div>
                    <div class="text-body-2 text-medium-emphasis mb-3">
                      {{ recipe.description || 'Apraksts nav pieejams' }}
                    </div>
                    <v-btn size="small" variant="tonal" class="pill-btn" :to="{ name: 'recipeDetail', params: { id: recipe.id } }">
                      Atvērt
                    </v-btn>
                  </v-card>
                </v-col>
              </v-row>
              <v-alert v-else type="info" variant="tonal">
                Jums vēl nav pievienotu recepšu.
              </v-alert>
            </div>
          </v-window-item>

          <v-window-item value="achievements">
            <div class="pa-5">
              <div class="d-flex flex-wrap align-end justify-space-between ga-4 mb-5">
                <div>
                  <div class="text-overline section-eyebrow">Sasniegumi</div>
                  <h2 class="text-h5 mb-1">Tavs sasniegumu ceļš</h2>
                  <p class="text-body-2 text-medium-emphasis achievement-section-copy">
                    Katrs sasniegums tiek aprēķināts no reāliem datiem: receptēm, sekotājiem, vērtējumiem,
                    komentāriem un kolekcijām.
                  </p>
                </div>

                <div class="achievement-summary">
                  <div class="achievement-summary__pill">
                    <span>Atbloķēti</span>
                    <strong>{{ achievementSummary.unlocked_count }} / {{ achievementSummary.total_count }}</strong>
                  </div>
                  <div class="achievement-summary__pill">
                    <span>Zelta līmenī</span>
                    <strong>{{ achievementSummary.gold_count }}</strong>
                  </div>
                  <div class="achievement-summary__pill achievement-summary__pill--accent">
                    <span>Kopējais progress</span>
                    <strong>{{ achievementSummary.completion_percentage }}%</strong>
                  </div>
                </div>
              </div>

              <v-row class="mb-4" dense>
                <v-col v-for="metric in achievementMetricCards" :key="metric.key" cols="12" sm="6" xl="3">
                  <div class="achievement-metric-card">
                    <div class="achievement-metric-card__icon">
                      <v-icon :icon="metric.icon" size="18" />
                    </div>
                    <div>
                      <div class="text-caption text-medium-emphasis">{{ metric.label }}</div>
                      <div class="text-subtitle-1 font-weight-bold">{{ metric.value }}</div>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-row v-if="achievements.length">
                <v-col v-for="achievement in achievements" :key="achievement.key" cols="12" md="6" xl="4">
                  <ProfileAchievementCard
                    :achievement="achievement"
                    :recently-unlocked="recentAchievementKeys.has(achievement.key)"
                  />
                </v-col>
              </v-row>

              <v-alert v-else type="info" variant="tonal" rounded="lg">
                Sasniegumi pašlaik nav pieejami.
              </v-alert>
            </div>
          </v-window-item>

          <v-window-item value="favorites">
            <div class="pa-5">
              <v-alert type="info" variant="tonal">Izlases saraksts pagaidām ir tukšs.</v-alert>
            </div>
          </v-window-item>

          <v-window-item value="comments">
            <div class="pa-5">
              <v-alert type="info" variant="tonal">Komentāri vēl nav pieejami šajā skatā.</v-alert>
            </div>
          </v-window-item>

          <v-window-item value="settings">
            <div class="pa-5">
              <v-form @submit.prevent="saveProfile">
                <v-row class="gy-3">
                  <v-col cols="12" md="6">
                    <v-text-field
                      ref="nameFieldRef"
                      v-model="profileForm.name"
                      label="Vārds"
                      :error-messages="profileSaveError ? [profileSaveError] : []"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field :model-value="auth.user?.email || ''" label="E-pasts" readonly />
                  </v-col>
                  <v-col cols="12">
                    <ImageSourceInput
                      v-model:url="profileForm.avatar_url"
                      v-model:file="profileForm.avatar"
                      v-model:mode="avatarInputMode"
                      v-model:remove-existing="profileForm.remove_avatar"
                      title="Profila attēls"
                      hint="Avataram var izmantot augšupielādētu failu vai ārēju saiti."
                      :existing-image-url="avatarPreview"
                      :allow-remove-existing="Boolean(avatarPreview)"
                      url-label="Avatar URL"
                      file-label="Augšupielādēt avataru"
                      remove-label="Noņemt pašreizējo avataru"
                      @validation="handleAvatarValidation"
                    />
                  </v-col>
                  <v-col cols="12" class="d-flex justify-end">
                    <v-btn type="submit" color="primary" class="pill-btn" :loading="isSavingProfile">
                      Saglabāt profilu
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </div>
          </v-window-item>
        </v-window>
      </v-card>
    </template>
  </v-container>

  <v-snackbar v-model="notification.show" :color="notification.color" timeout="2300">
    {{ notification.text }}
  </v-snackbar>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import ImageSourceInput from '../components/ImageSourceInput.vue'
import ProfileAchievementCard from '../components/ProfileAchievementCard.vue'
import { useAuthStore } from '../stores/auth'
import { useAchievementNotificationsStore } from '../stores/achievementNotifications'

const auth = useAuthStore()
const router = useRouter()
const achievementNotifications = useAchievementNotificationsStore()

const selectedTab = ref('recipes')
const ownRecipes = ref([])
const tabsCardRef = ref(null)
const nameFieldRef = ref(null)
const isLoadingProfile = ref(false)
const isSavingProfile = ref(false)
const profileLoadError = ref('')
const profileSaveError = ref('')
const avatarInputMode = ref('file')
const avatarValidation = ref({ isValid: true, urlErrors: [], fileErrors: [] })
const profileForm = reactive({
  name: '',
  avatar_url: '',
  avatar: null,
  remove_avatar: false,
})
const notification = reactive({
  show: false,
  text: '',
  color: 'success',
})

const profileStats = ref({
  recipes_count: 0,
  total_favorites_received: 0,
  followers_count: 0,
  comments_count: 0,
  ratings_given_count: 0,
  collections_count: 0,
  average_rating: 0,
})

const achievementSummary = ref({
  total_count: 0,
  unlocked_count: 0,
  locked_count: 0,
  gold_count: 0,
  completion_percentage: 0,
})

const achievements = ref([])

const avatarPreview = computed(() => auth.user?.avatar_url || '')
const profileInitial = computed(() => (auth.user?.name?.trim()?.charAt(0) || 'P').toUpperCase())
const roleLabel = computed(() => {
  const role = auth.role
  if (role === 'admin') return 'Administrators'
  if (role === 'author') return 'Autors'
  if (role === 'user') return 'Lietotājs'
  return 'Viesis'
})

const statsCards = computed(() => ([
  {
    key: 'recipes',
    label: 'Receptes',
    value: profileStats.value.recipes_count,
    caption: 'Publicētās receptes',
    icon: 'mdi-chef-hat',
    highlight: false,
  },
  {
    key: 'followers',
    label: 'Sekotāji',
    value: profileStats.value.followers_count,
    caption: 'Tava auditorija platformā',
    icon: 'mdi-account-group-outline',
    highlight: false,
  },
  {
    key: 'rating',
    label: 'Vidējais vērtējums',
    value: Number(profileStats.value.average_rating || 0).toFixed(1),
    caption: 'Par tavām receptēm',
    icon: 'mdi-star-outline',
    highlight: false,
  },
  {
    key: 'achievements',
    label: 'Sasniegumi',
    value: `${achievementSummary.value.unlocked_count}/${achievementSummary.value.total_count}`,
    caption: `${achievementSummary.value.completion_percentage}% no kopējā progresa`,
    icon: 'mdi-trophy-outline',
    highlight: true,
  },
]))

const achievementMetricCards = computed(() => ([
  {
    key: 'favorites',
    label: 'Saņemtie favorīti',
    value: profileStats.value.total_favorites_received,
    icon: 'mdi-heart-outline',
  },
  {
    key: 'comments',
    label: 'Komentāri',
    value: profileStats.value.comments_count,
    icon: 'mdi-comment-multiple-outline',
  },
  {
    key: 'ratings',
    label: 'Dotie vērtējumi',
    value: profileStats.value.ratings_given_count,
    icon: 'mdi-star-circle-outline',
  },
  {
    key: 'collections',
    label: 'Kolekcijas',
    value: profileStats.value.collections_count,
    icon: 'mdi-bookmark-box-multiple-outline',
  },
]))

const previewAchievements = computed(() => achievements.value.slice(0, 4))

const recentAchievementKeys = computed(() => {
  const keys = new Set(achievementNotifications.recentAchievementKeys)

  for (const achievement of achievements.value) {
    if (achievement?.is_recently_unlocked) {
      keys.add(achievement.key)
    }
  }

  return keys
})

function scrollToTabs() {
  const el = tabsCardRef.value?.$el || tabsCardRef.value
  if (el?.scrollIntoView) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function showSettingsSnackbar(text, color = 'success') {
  notification.text = text
  notification.color = color
  notification.show = true
}

async function openSettingsTab() {
  selectedTab.value = 'settings'
  await nextTick()
  scrollToTabs()
  await nextTick()
  nameFieldRef.value?.focus?.()
}

async function openAchievementsTab() {
  selectedTab.value = 'achievements'
  await nextTick()
  scrollToTabs()
}

function openMessages() {
  router.push({ name: 'contact', query: { tema: 'zinojumi' } })
}

function handleAvatarValidation(payload) {
  avatarValidation.value = payload
}

function getSelectedAvatar() {
  return Array.isArray(profileForm.avatar) ? profileForm.avatar[0] : profileForm.avatar
}

function normalizeStats(payload) {
  return {
    recipes_count: Number(payload?.recipes_count || 0),
    total_favorites_received: Number(payload?.total_favorites_received || 0),
    followers_count: Number(payload?.followers_count || 0),
    comments_count: Number(payload?.comments_count || 0),
    ratings_given_count: Number(payload?.ratings_given_count || 0),
    collections_count: Number(payload?.collections_count || 0),
    average_rating: Number(payload?.average_rating || 0),
  }
}

async function saveProfile() {
  const nextName = String(profileForm.name || '').trim()
  profileSaveError.value = ''

  if (!nextName) {
    profileSaveError.value = 'Vārds ir obligāts.'
    return
  }

  if (!avatarValidation.value.isValid) {
    profileSaveError.value = [...avatarValidation.value.urlErrors, ...avatarValidation.value.fileErrors][0] || 'Profila attēls nav derīgs.'
    return
  }

  isSavingProfile.value = true
  try {
    const selectedAvatar = getSelectedAvatar()
    const basePayload = {
      name: nextName,
      avatar_url: avatarInputMode.value === 'url' ? (profileForm.avatar_url.trim() || null) : undefined,
      remove_avatar: profileForm.remove_avatar ? true : undefined,
    }

    let res

    if (avatarInputMode.value === 'file' && selectedAvatar instanceof File) {
      const payload = new FormData()
      payload.append('name', basePayload.name)
      payload.append('_method', 'PUT')
      payload.append('avatar', selectedAvatar)

      if (profileForm.remove_avatar) {
        payload.append('remove_avatar', '1')
      }

      res = await api.post('/profile', payload)
    } else {
      res = await api.put('/profile', basePayload)
    }

    const updatedUser = res.data?.user || {}
    auth.setAuth(auth.token, { ...auth.user, ...updatedUser, name: updatedUser.name || nextName })
    profileForm.name = auth.user?.name || nextName
    profileForm.avatar = null
    profileForm.avatar_url = auth.user?.avatar_input_url || ''
    profileForm.remove_avatar = false
    avatarInputMode.value = auth.user?.avatar_source || 'file'
    showSettingsSnackbar('Profils veiksmīgi atjaunināts.')
    await loadProfileData()
  } catch (err) {
    profileSaveError.value = err?.response?.data?.message || 'Neizdevās saglabāt profilu.'
    showSettingsSnackbar('Neizdevās saglabāt profilu.', 'error')
  } finally {
    isSavingProfile.value = false
  }
}

async function loadProfileData() {
  if (!auth.user?.id) return

  isLoadingProfile.value = true
  profileLoadError.value = ''

  try {
    const res = await api.get('/profile')
    profileStats.value = normalizeStats(res.data?.stats)
    achievementSummary.value = {
      total_count: Number(res.data?.achievement_summary?.total_count || 0),
      unlocked_count: Number(res.data?.achievement_summary?.unlocked_count || 0),
      locked_count: Number(res.data?.achievement_summary?.locked_count || 0),
      gold_count: Number(res.data?.achievement_summary?.gold_count || 0),
      completion_percentage: Number(res.data?.achievement_summary?.completion_percentage || 0),
    }
    achievements.value = Array.isArray(res.data?.achievements) ? res.data.achievements : []
    ownRecipes.value = Array.isArray(res.data?.recipes) ? res.data.recipes : []

    const pendingNotifications = Array.isArray(res.data?.achievement_notifications?.pending)
      ? res.data.achievement_notifications.pending
      : []

    achievementNotifications.mergeNotifications(pendingNotifications)
  } catch (err) {
    profileLoadError.value = err?.response?.data?.message || 'Neizdevās ielādēt profila datus.'
    ownRecipes.value = []
    achievements.value = []
  } finally {
    isLoadingProfile.value = false
  }
}

onMounted(async () => {
  profileForm.name = auth.user?.name || ''
  profileForm.avatar_url = auth.user?.avatar_input_url || ''
  avatarInputMode.value = auth.user?.avatar_source || 'file'
  await loadProfileData()
})
</script>

<style scoped>
.profile-page {
  max-width: 1220px;
}

.profile-hero {
  border: 1px solid rgba(15, 23, 42, 0.06);
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.46), transparent 34%),
    linear-gradient(135deg, #FDF6EE, #F7E9DA 52%, #F5DDC9);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);
}

.hero-eyebrow,
.section-eyebrow {
  color: rgba(133, 77, 14, 0.82);
  letter-spacing: 0.08em;
}

.profile-avatar {
  font-size: 1.8rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.55);
  color: rgb(var(--v-theme-primary));
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.role-badge,
.pill-btn {
  border-radius: 999px;
}

.stat-card,
.achievements-wrap,
.profile-tabs-wrap,
.recipe-card {
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.05);
}

.stat-card {
  height: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
}

.stat-highlight {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.14), rgba(255, 255, 255, 0.96));
  border-color: rgba(var(--v-theme-primary), 0.22);
}

.stat-card__icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.achievement-section-copy,
.achievement-preview-copy {
  max-width: 56ch;
  margin: 0;
}

.achievements-preview {
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.05);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.98));
}

.achievement-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.achievement-summary__pill {
  min-width: 148px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: rgba(255, 255, 255, 0.78);
}

.achievement-summary__pill span {
  display: block;
  margin-bottom: 4px;
  font-size: 0.78rem;
  color: rgba(15, 23, 42, 0.6);
}

.achievement-summary__pill strong {
  font-size: 1rem;
  font-weight: 700;
}

.achievement-summary__pill--accent {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.14), rgba(255, 255, 255, 0.92));
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.achievement-metric-card {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(15, 23, 42, 0.05);
}

.achievement-metric-card__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.09);
}

.achievement-preview-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.achievement-preview-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.07);
  background: rgba(255, 255, 255, 0.78);
  font-size: 0.88rem;
}

.achievement-preview-pill strong {
  margin-left: 6px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.achievement-preview-pill--locked {
  opacity: 0.7;
}

.recipe-card {
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.08);
}

.profile-tabs :deep(.v-slide-group__content) {
  gap: 6px;
}

.profile-tabs :deep(.v-tab) {
  text-transform: none;
  min-width: auto;
}

.profile-tabs :deep(.v-tab--selected) {
  font-weight: 700;
}

@media (max-width: 760px) {
  .profile-hero {
    padding: 24px !important;
  }

  .achievement-summary__pill {
    width: 100%;
  }
}

:deep(.v-theme--dark) .profile-hero {
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.08), transparent 34%),
    linear-gradient(135deg, rgba(190, 99, 37, 0.3), rgba(39, 31, 24, 0.94) 56%, rgba(19, 23, 31, 0.98));
}

:deep(.v-theme--dark) .stat-card,
:deep(.v-theme--dark) .achievements-preview,
:deep(.v-theme--dark) .achievements-wrap,
:deep(.v-theme--dark) .profile-tabs-wrap,
:deep(.v-theme--dark) .recipe-card,
:deep(.v-theme--dark) .achievement-summary__pill,
:deep(.v-theme--dark) .achievement-metric-card {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(10, 16, 24, 0.78);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
}

:deep(.v-theme--dark) .stat-highlight,
:deep(.v-theme--dark) .achievement-summary__pill--accent {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.16), rgba(10, 16, 24, 0.86));
}

:deep(.v-theme--dark) .achievement-preview-pill {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(10, 16, 24, 0.72);
}
</style>
