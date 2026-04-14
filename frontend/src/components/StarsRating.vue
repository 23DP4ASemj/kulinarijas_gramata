<template>
  <div class="d-flex align-center ga-1">
    <v-btn
      v-for="n in 5"
      :key="n"
      :disabled="readonly"
      icon
      variant="text"
      size="small"
      @click="onRate(n)"
    >
      <v-icon :icon="n <= Math.round(displayValue) ? 'mdi-star' : 'mdi-star-outline'" color="amber" />
    </v-btn>
    <span v-if="showValue" class="text-caption text-medium-emphasis">
      {{ displayValue.toFixed(1) }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false },
  showValue: { type: Boolean, default: false },
})

const emit = defineEmits(['rate'])

const displayValue = computed(() => Number(props.value || 0))

function onRate(value) {
  if (props.readonly) return
  emit('rate', value)
}
</script>
