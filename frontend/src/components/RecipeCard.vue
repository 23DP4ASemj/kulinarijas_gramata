<template>
  <v-card class="recipe-card" variant="outlined" rounded="xl">
    <v-img
      v-if="recipe.image_url"
      :src="recipe.image_url"
      height="180"
      cover
    />
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-truncate">{{ recipe.title }}</span>
      <FavoritesButton
        :is-favorited="recipe.is_favorited_by_me"
        :count="recipe.favorites_count || 0"
        :disabled="!canFavorite"
        @toggle="$emit('toggle-favorite', recipe)"
      />
    </v-card-title>
    <v-card-text class="pt-0">
      <div class="d-flex flex-wrap align-center ga-2 mb-3">
        <v-chip size="small" color="primary" variant="tonal">
          {{ recipe.category?.name || 'Bez kategorijas' }}
        </v-chip>
        <v-chip size="small" color="deep-orange" variant="tonal">
          {{ recipe.difficulty || 'Nezināma' }}
        </v-chip>
        <span class="text-medium-emphasis">{{ recipe.prep_time_minutes ?? 0 }} min</span>
      </div>
      <div class="d-flex align-center ga-2 text-medium-emphasis">
        <StarsRating :value="recipe.avg_rating || 0" readonly show-value />
        <span>({{ recipe.ratings_count || 0 }})</span>
      </div>
      <div class="text-medium-emphasis mt-1">
        by {{ recipe.author?.name || 'Unknown' }}
      </div>
      <div class="mt-3 d-flex justify-space-between align-center">
        <v-btn size="small" variant="flat" color="primary" @click="$emit('open', recipe)">
          Skatīt
        </v-btn>
        <v-btn
          v-if="showDelete"
          size="small"
          variant="tonal"
          color="error"
          @click="$emit('delete', recipe)"
        >
          Dzēst
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import FavoritesButton from './FavoritesButton.vue'
import StarsRating from './StarsRating.vue'

defineProps({
  recipe: { type: Object, required: true },
  canFavorite: { type: Boolean, default: false },
  showDelete: { type: Boolean, default: false },
})

defineEmits(['open', 'toggle-favorite', 'delete'])
</script>

<style scoped>
.recipe-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.recipe-card:hover {
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  transform: translateY(-2px);
}
</style>
