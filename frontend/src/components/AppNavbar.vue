<template>
  <v-app-bar flat :height="appBarHeight" class="top-bar px-2 px-md-6">
    <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />

    <v-app-bar-title class="app-title">
      <RouterLink :to="{ name: 'home' }" class="brand-link">
        <img :src="logo.src" :alt="logo.alt" class="logo-img" />
      </RouterLink>
    </v-app-bar-title>

    <div class="d-none d-md-flex align-center nav-group">
      <v-btn variant="text" class="nav-link" :class="{ 'active-nav': isRouteActive('home') }" :to="{ name: 'home' }">Galvenā</v-btn>
      <v-btn variant="text" class="nav-link" :class="{ 'active-nav': isRouteActive('recipes') }" :to="{ name: 'recipes' }">Receptes</v-btn>
      <v-btn variant="text" class="nav-link" :class="{ 'active-nav': isRouteActive('blogs') }" :to="{ name: 'blogs' }">Blogs</v-btn>
      <v-btn variant="text" class="nav-link" :class="{ 'active-nav': isRouteActive('dashboard') }" :to="{ name: 'dashboard' }">Panelis</v-btn>
      <v-btn
        v-if="canCreateRecipe"
        variant="text"
        class="nav-link"
        :class="{ 'active-nav': isRouteActive('recipeCreate') }"
        :to="{ name: 'recipeCreate' }"
      >
        Pievienot recepti
      </v-btn>

      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            class="nav-link"
            :class="{ 'active-nav': isAnyRouteActive(['collections', 'subscriptions', 'contact']) }"
          >
            Vairāk
          </v-btn>
        </template>
        <v-list class="menu-list">
          <v-list-item title="Kolekcijas" @click="go({ name: 'collections' })" />
          <v-list-item title="Abonementi" @click="go({ name: 'subscriptions' })" />
          <v-list-item title="Kontakti" @click="go({ name: 'contact' })" />
        </v-list>
      </v-menu>

      <v-menu v-if="!auth.isAuthenticated" location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" class="nav-link nav-auth">Autorizācija</v-btn>
        </template>
        <v-list class="menu-list auth-menu">
          <v-list-item title="Ieiet" @click="go({ name: 'login' })" />
          <v-list-item title="Reģistrācija" @click="go({ name: 'register' })" />
        </v-list>
      </v-menu>

      <v-btn
        v-else
        variant="text"
        class="profile-pill d-inline-flex align-center ga-2"
        :to="{ name: 'profile' }"
      >
        <v-avatar size="28" color="primary">
          <v-img v-if="auth.user?.avatar_url" :src="auth.user.avatar_url" cover />
          <template v-else>{{ profileInitial }}</template>
        </v-avatar>
        <span>Profils - {{ auth.user?.name }}</span>
      </v-btn>

      <v-btn
        v-if="auth.isAuthenticated"
        icon="mdi-logout"
        variant="text"
        aria-label="Iziet"
        @click="logoutAndGoHome"
      />
    </div>

    <v-spacer />

    <v-btn
      v-if="auth.isAdmin"
      class="admin-shortcut d-none d-md-inline-flex mr-2"
      :class="{ 'active-admin': isRouteActive('adminDashboard') }"
      variant="flat"
      color="primary"
      :to="{ name: 'adminDashboard' }"
    >
      <v-icon icon="mdi-shield-crown-outline" start />
      Admina panelis
    </v-btn>

    <v-btn icon class="theme-btn" :aria-label="themeLabel" @click="toggleTheme">
      <v-icon>{{ themeIcon }}</v-icon>
    </v-btn>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary class="d-md-none nav-drawer">
    <v-list nav class="pa-2">
      <v-list-item title="Galvenā" @click="go({ name: 'home' }, true)" />
      <v-list-item title="Receptes" @click="go({ name: 'recipes' }, true)" />
      <v-list-item title="Blogs" @click="go({ name: 'blogs' }, true)" />
      <v-list-item title="Panelis" @click="go({ name: 'dashboard' }, true)" />
      <v-list-item title="Kolekcijas" @click="go({ name: 'collections' }, true)" />
      <v-list-item title="Abonementi" @click="go({ name: 'subscriptions' }, true)" />
      <v-list-item
        title="Pievienot recepti"
        :disabled="!canCreateRecipe"
        @click="go({ name: 'recipeCreate' }, true)"
      />
      <v-list-item title="Kontakti" @click="go({ name: 'contact' }, true)" />

      <v-list-item
        v-if="auth.isAuthenticated"
        :title="`Profils: ${auth.user?.name || ''}`"
        @click="go({ name: 'profile' }, true)"
      />
      <v-list-item
        v-if="auth.isAdmin"
        title="Admina panelis"
        @click="go({ name: 'adminDashboard' }, true)"
      />

      <v-list-item
        v-if="auth.isAuthenticated"
        title="Iziet"
        @click="logoutAndGoHome(true)"
      />

      <v-list-group v-else value="Autorizācija">
        <template #activator="{ props }">
          <v-list-item v-bind="props" title="Autorizācija" />
        </template>
        <v-list-item title="Ieiet" @click="go({ name: 'login' }, true)" />
        <v-list-item title="Reģistrācija" @click="go({ name: 'register' }, true)" />
      </v-list-group>
    </v-list>

    <v-divider class="my-4" />

    <div class="px-4 pb-4">
      <v-btn block variant="tonal" @click="toggleTheme">
        {{ themeLabel }}
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay, useTheme } from 'vuetify'
import { uiTheme } from '../config/uiTheme'
import { useAuthStore } from '../stores/auth'
import { setSavedTheme } from '../plugins/vuetify'

const drawer = ref(false)
const router = useRouter()
const route = useRoute()
const theme = useTheme()
const display = useDisplay()
const auth = useAuthStore()
const logo = uiTheme.logo
const appBarHeight = computed(() => (display.mdAndUp.value ? 108 : 92))

const profileInitial = computed(() => (auth.user?.name?.trim()?.charAt(0) || 'P').toUpperCase())
const canCreateRecipe = computed(() => auth.isAuthenticated)

const themeIcon = computed(() => (theme.global.name.value === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'))
const themeLabel = computed(() => (
  theme.global.name.value === 'dark' ? 'Gaišais režīms' : 'Tumšais režīms'
))

function toggleTheme() {
  const next = theme.global.name.value === 'dark' ? 'light' : 'dark'
  theme.global.name.value = next
  setSavedTheme(next)
}

function isRouteActive(name) {
  return route.name === name
}

function isAnyRouteActive(names) {
  return names.includes(route.name)
}

function go(to, closeDrawer = false) {
  router.push(to)
  if (closeDrawer) {
    drawer.value = false
  }
}

async function logoutAndGoHome(closeDrawer = false) {
  await auth.logout()
  go({ name: 'home' }, closeDrawer)
}
</script>

<style scoped>
.top-bar {
  backdrop-filter: blur(8px);
  min-height: var(--kg-app-bar-height);
}

.brand-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  padding: 6px 0;
  min-height: calc(var(--kg-logo-height) + 8px);
}

.logo-img {
  display: block;
  width: auto;
  height: min(var(--kg-logo-height), calc(var(--kg-app-bar-height) - 16px));
  object-fit: contain;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.08));
}

.app-title {
  min-width: 360px;
}

.nav-group {
  gap: 8px;
}

.nav-link {
  border-radius: 999px;
  padding: 8px 18px;
  min-height: 42px;
  color: rgba(var(--v-theme-on-surface), 0.9);
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.2;
}

.active-nav {
  background: #F2EEE9;
}

.nav-link:hover {
  background-color: rgba(var(--v-theme-primary), 0.12);
  transform: translateY(-1px);
}

.nav-auth {
  background: rgba(var(--v-theme-primary), 0.08);
}

.profile-pill {
  border-radius: 999px;
  padding: 6px 14px;
  background: rgba(var(--v-theme-primary), 0.08);
  min-height: 42px;
  color: inherit;
}

.profile-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.theme-btn {
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.08);
}

.admin-shortcut {
  border-radius: 999px;
  min-height: 40px;
  font-weight: 700;
  padding: 0 16px;
}

.admin-shortcut:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.active-admin {
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.55);
}

.menu-list {
  border-radius: 16px;
  padding: 6px;
}

.nav-drawer {
  border-top-right-radius: 18px;
  border-bottom-right-radius: 18px;
}

@media (max-width: 960px) {
  .app-title {
    min-width: 240px;
  }

  .brand-link {
    min-height: calc(var(--kg-logo-height-mobile) + 8px);
  }

  .logo-img {
    height: min(var(--kg-logo-height-mobile), calc(var(--kg-app-bar-height) - 18px));
  }
}

:deep(.v-theme--dark) .active-nav {
  background: rgba(255, 255, 255, 0.12);
}

:deep(.v-theme--dark) .profile-pill,
:deep(.v-theme--dark) .theme-btn,
:deep(.v-theme--dark) .nav-auth {
  background: rgba(230, 126, 34, 0.18);
}
</style>
