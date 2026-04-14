<template>
  <v-list class="comment-list" lines="two">
    <v-list-item v-for="comment in comments" :key="comment.id">
      <v-list-item-title class="text-subtitle-2">
        {{ comment.user?.name || 'Anonymous' }}
      </v-list-item-title>
      <v-list-item-subtitle>{{ comment.text }}</v-list-item-subtitle>

      <template #append>
        <v-btn
          v-if="isAdmin || Number(comment.user?.id) === Number(currentUserId)"
          icon
          variant="text"
          color="error"
          @click="$emit('delete', comment)"
        >
          <v-icon icon="mdi-delete" />
        </v-btn>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup>
defineProps({
  comments: { type: Array, default: () => [] },
  currentUserId: { type: [Number, String], default: null },
  isAdmin: { type: Boolean, default: false },
})

defineEmits(['delete'])
</script>

<style scoped>
.comment-list {
  background: transparent;
}
</style>
