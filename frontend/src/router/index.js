import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import ContactPage from '../pages/ContactPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import RecipesPage from '../pages/RecipesPage.vue'
import CollectionsPage from '../pages/CollectionsPage.vue'
import SubscriptionsPage from '../pages/SubscriptionsPage.vue'
import RecipeDetailPage from '../pages/RecipeDetailPage.vue'
import RecipeFormPage from '../pages/RecipeFormPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import UserProfilePage from '../pages/UserProfilePage.vue'
import BlogsPage from '../pages/BlogsPage.vue'
import BlogsReadPage from '../pages/BlogsReadPage.vue'
import AdminDashboardPage from '../pages/AdminDashboardPage.vue'
import { getStoredToken, getStoredUser } from '../utils/authStorage'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/kontakti', alias: ['/contact'], name: 'contact', component: ContactPage },
  { path: '/panelis', alias: ['/dashboard'], name: 'dashboard', component: DashboardPage },
  { path: '/receptes', alias: ['/recipes'], name: 'recipes', component: RecipesPage },
  { path: '/receptes/:id', alias: ['/recipes/:id'], name: 'recipeDetail', component: RecipeDetailPage },
  { path: '/receptes/:id/labot', alias: ['/recipes/:id/edit'], name: 'recipeEdit', component: RecipeFormPage, meta: { requiresAuth: true } },
  { path: '/pievienot-recepti', alias: ['/recipes/create'], name: 'recipeCreate', component: RecipeFormPage, meta: { requiresAuth: true } },
  { path: '/kolekcijas', alias: ['/collections'], name: 'collections', component: CollectionsPage, meta: { requiresAuth: true } },
  { path: '/abonementi', alias: ['/subscriptions'], name: 'subscriptions', component: SubscriptionsPage, meta: { requiresAuth: true } },
  { path: '/profile', name: 'profile', component: ProfilePage, meta: { requiresAuth: true } },
  { path: '/u/:id', alias: ['/users/:id'], name: 'publicProfile', component: UserProfilePage },
  { path: '/profile/:id', redirect: (to) => ({ name: 'publicProfile', params: { id: to.params.id } }) },
  { path: '/blogs', name: 'blogs', component: BlogsPage },
  { path: '/blogs/:id', name: 'blogRead', component: BlogsReadPage },
  { path: '/admin/panelis', alias: ['/admin/dashboard'], name: 'adminDashboard', component: AdminDashboardPage, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/login', name: 'login', component: LoginPage, meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: RegisterPage, meta: { guestOnly: true } },
  { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to) => {
  const token = getStoredToken()
  const user = getStoredUser()

  if (to.meta.guestOnly && token) {
    return { name: 'home' }
  }

  if (to.meta.requiresAuth && !token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.roles?.length) {
    if (!token) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    if (!user || !to.meta.roles.includes(user.role)) {
      return { name: 'home' }
    }
  }

  return true
})

export default router
