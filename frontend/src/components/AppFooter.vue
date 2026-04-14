<template>
  <v-footer class="app-footer mt-10">
    <v-container class="footer-container">
      <v-row class="footer-grid" justify="space-between">
        <v-col cols="12" md="3">
          <h3 class="text-h6 mb-4">Kulinārijas grāmata</h3>
          <p class="text-body-2 text-medium-emphasis mb-5">
            Platforma receptēm, kolekcijām un kulinārijas stāstiem vienuviet.
          </p>
          <div class="d-flex ga-3">
            <v-btn icon size="small" variant="text" class="social-btn"><v-icon icon="mdi-facebook" /></v-btn>
            <v-btn icon size="small" variant="text" class="social-btn"><v-icon icon="mdi-instagram" /></v-btn>
            <v-btn icon size="small" variant="text" class="social-btn"><v-icon icon="mdi-pinterest" /></v-btn>
            <v-btn icon size="small" variant="text" class="social-btn"><v-icon icon="mdi-youtube" /></v-btn>
          </div>
        </v-col>

        <v-col cols="12" md="3">
          <h4 class="text-subtitle-1 mb-4 footer-heading">Navigācija</h4>
          <div class="d-flex flex-column ga-2">
            <RouterLink class="footer-link" :to="{ name: 'home' }">Galvenā</RouterLink>
            <RouterLink class="footer-link" :to="{ name: 'recipeCreate' }">Pievienot recepti</RouterLink>
            <RouterLink class="footer-link" :to="{ name: 'profile' }">Profils</RouterLink>
            <RouterLink class="footer-link" :to="{ name: 'collections' }">Kolekcijas</RouterLink>
            <RouterLink class="footer-link" :to="{ name: 'blogs' }">Blogs</RouterLink>
          </div>
        </v-col>

        <v-col cols="12" md="3">
          <h4 class="text-subtitle-1 mb-4 footer-heading">Kategorijas</h4>
          <ul class="footer-list">
            <li v-for="item in categoryLinks" :key="item.label">
              <RouterLink class="footer-list-link" :to="item.to">
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </v-col>

        <v-col cols="12" md="3">
          <h4 class="text-subtitle-1 mb-4 footer-heading">Atbalsts</h4>
          <ul class="footer-list">
            <li v-for="item in supportLinks" :key="item.label">
              <RouterLink class="footer-list-link" :to="item.to">
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </v-col>
      </v-row>

      <v-divider class="my-8" />
      <div class="text-center text-caption text-medium-emphasis">© 2024 Kulinārijas grāmata. Visas tiesības aizsargātas.</div>
    </v-container>
  </v-footer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRecipeCategoriesStore } from '../stores/recipeCategories'

const categoriesStore = useRecipeCategoriesStore()

const categoryLinks = computed(() => categoriesStore.items.slice(0, 5).map((item) => ({
  label: item.name,
  to: { name: 'recipes', query: { category_id: String(item.id) } },
})))

const supportLinks = [
  { label: 'Palīdzība centrs', to: { name: 'contact', query: { tema: 'palidziba' } } },
  { label: 'Kontakti', to: { name: 'contact' } },
  { label: 'Privātuma politika', to: { name: 'contact', query: { tema: 'privatuma-politika' } } },
  { label: 'Lietošanas noteikumi', to: { name: 'contact', query: { tema: 'lietosanas-noteikumi' } } },
]

onMounted(() => {
  categoriesStore.fetchAll().catch(() => {})
})
</script>

<style scoped>
.app-footer {
  background: var(--kg-footer-bg, #F0ECE7);
  border-top: 1px solid var(--kg-footer-border, rgba(0, 0, 0, 0.05));
}

.footer-container {
  padding-top: 64px;
  padding-bottom: 64px;
}

.footer-grid {
  row-gap: 26px;
}

.footer-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.25s ease, transform 0.25s ease;
}

.footer-link:hover {
  color: rgb(var(--v-theme-primary));
  transform: translateX(3px);
}

.footer-heading {
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: rgba(var(--v-theme-on-surface), 0.92);
}

.footer-heading::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 42px;
  height: 3px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.62);
}

.footer-list {
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.footer-list-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.25s ease;
}

.footer-list-link:hover {
  color: rgb(var(--v-theme-primary));
}

.social-btn {
  background: rgba(230, 126, 34, 0.14);
  border: 1px solid rgba(230, 126, 34, 0.22);
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 0 6px rgba(230, 126, 34, 0.12);
}

@media (max-width: 960px) {
  .footer-container {
    padding-top: 52px;
    padding-bottom: 52px;
  }
}
</style>

