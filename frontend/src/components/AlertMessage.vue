<template>
  <v-alert v-if="message" :type="type" variant="tonal" rounded="lg" class="mb-4">
    {{ message }}
  </v-alert>
</template>

<script setup>
defineProps({
  message: { type: String, default: '' },
  type: { type: String, default: 'info' },
})
</script>
