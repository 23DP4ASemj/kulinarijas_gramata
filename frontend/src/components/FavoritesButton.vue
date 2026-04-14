<template>
  <div class="d-flex align-center ga-2">
    <v-btn
      :disabled="disabled"
      icon
      variant="text"
      :color="isFavorited ? 'red' : 'grey'"
      @click="$emit('toggle')"
    >
      <v-icon :icon="isFavorited ? 'mdi-heart' : 'mdi-heart-outline'" />
    </v-btn>
    <span class="text-caption text-medium-emphasis">{{ count }}</span>
  </div>
</template>

<script setup>
defineProps({
  isFavorited: { type: Boolean, default: false },
  count: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false },
})

defineEmits(['toggle'])
</script>
