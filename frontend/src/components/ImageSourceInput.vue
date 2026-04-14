<template>
  <div class="image-source-input">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-3">
      <div>
        <div class="text-subtitle-1 font-weight-medium">{{ title }}</div>
        <div v-if="hint" class="text-body-2 text-medium-emphasis">{{ hint }}</div>
      </div>

      <v-btn-toggle
        :model-value="modeValue"
        mandatory
        divided
        rounded="pill"
        color="primary"
        @update:modelValue="handleModeChange"
      >
        <v-btn value="file" size="small">Augšupielādēt failu</v-btn>
        <v-btn value="url" size="small">Ievietot URL</v-btn>
      </v-btn-toggle>
    </div>

    <v-text-field
      v-if="modeValue === 'url'"
      :model-value="urlValue"
      :label="urlLabel"
      placeholder="https://example.com/image.jpg"
      prepend-inner-icon="mdi-link-variant"
      :error-messages="urlErrors"
      hide-details="auto"
      @update:modelValue="updateUrl"
    />

    <v-file-input
      v-else
      :model-value="fileValue"
      :label="fileLabel"
      :accept="accept"
      prepend-icon="mdi-image"
      show-size
      clearable
      :error-messages="fileErrors"
      hide-details="auto"
      @update:modelValue="updateFile"
    />

    <div v-if="previewSource" class="preview-shell mt-3">
      <v-img :src="previewSource" height="210" cover class="rounded-lg" />
      <div class="text-caption text-medium-emphasis mt-2">{{ previewLabel }}</div>
      <v-checkbox
        v-if="allowRemoveExisting && existingImageUrl"
        :model-value="removeExistingValue"
        :label="removeLabel"
        hide-details
        class="mt-1"
        @update:modelValue="updateRemoveExisting"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  detectImageInputMode,
  validateImageFile,
  validateImageUrl,
} from '../utils/imageUpload'

const props = defineProps({
  title: {
    type: String,
    default: 'Attēls',
  },
  hint: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: '',
  },
  file: {
    default: null,
  },
  mode: {
    type: String,
    default: '',
  },
  existingImageUrl: {
    type: String,
    default: '',
  },
  allowRemoveExisting: {
    type: Boolean,
    default: false,
  },
  removeExisting: {
    type: Boolean,
    default: false,
  },
  urlLabel: {
    type: String,
    default: 'Attēla saite (URL)',
  },
  fileLabel: {
    type: String,
    default: 'Attēls no ierīces',
  },
  removeLabel: {
    type: String,
    default: 'Noņemt pašreizējo attēlu',
  },
  accept: {
    type: String,
    default: 'image/jpeg,image/png,image/webp,image/gif',
  },
})

const emit = defineEmits([
  'update:url',
  'update:file',
  'update:mode',
  'update:removeExisting',
  'validation',
])

const objectPreviewUrl = ref('')

const selectedFile = computed(() => {
  if (Array.isArray(props.file)) {
    return props.file[0] || null
  }
  return props.file || null
})

const modeValue = computed(() => props.mode || detectImageInputMode({
  url: props.url,
  file: selectedFile.value,
  existingUrl: props.existingImageUrl,
}))

const urlValue = computed(() => props.url || '')
const fileValue = computed(() => props.file)
const removeExistingValue = computed(() => props.removeExisting)
const urlErrors = computed(() => validateImageUrl(urlValue.value))
const fileErrors = computed(() => validateImageFile(selectedFile.value))

const previewSource = computed(() => {
  if (props.allowRemoveExisting && removeExistingValue.value && !objectPreviewUrl.value && !urlValue.value.trim()) {
    return ''
  }
  if (modeValue.value === 'file' && objectPreviewUrl.value) {
    return objectPreviewUrl.value
  }
  if (modeValue.value === 'url' && urlValue.value.trim()) {
    return urlValue.value.trim()
  }
  return props.existingImageUrl || ''
})

const previewLabel = computed(() => {
  if (modeValue.value === 'file' && objectPreviewUrl.value) {
    return 'Priekšskatījums no augšupielādētā faila'
  }
  if (modeValue.value === 'url' && urlValue.value.trim()) {
    return 'Priekšskatījums no URL'
  }
  return 'Pašreizējais attēls'
})

function syncValidation() {
  emit('validation', {
    isValid: urlErrors.value.length === 0 && fileErrors.value.length === 0,
    urlErrors: urlErrors.value,
    fileErrors: fileErrors.value,
  })
}

function revokeObjectUrl() {
  if (objectPreviewUrl.value) {
    URL.revokeObjectURL(objectPreviewUrl.value)
    objectPreviewUrl.value = ''
  }
}

function refreshPreviewFromFile(file) {
  revokeObjectUrl()
  if (file instanceof File) {
    objectPreviewUrl.value = URL.createObjectURL(file)
  }
}

function handleModeChange(nextMode) {
  emit('update:mode', nextMode)
}

function updateUrl(value) {
  emit('update:url', value)
  if (value?.trim()) {
    emit('update:removeExisting', false)
  }
}

function updateFile(value) {
  emit('update:file', value)
  const nextFile = Array.isArray(value) ? value[0] : value
  refreshPreviewFromFile(nextFile)
  if (nextFile) {
    emit('update:removeExisting', false)
  }
}

function updateRemoveExisting(value) {
  emit('update:removeExisting', value)
}

watch(() => selectedFile.value, (file) => {
  refreshPreviewFromFile(file)
  syncValidation()
}, { immediate: true })

watch(() => urlValue.value, () => {
  syncValidation()
}, { immediate: true })

onBeforeUnmount(() => {
  revokeObjectUrl()
})
</script>

<style scoped>
.image-source-input {
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(var(--v-theme-surface), 0.84);
}

.preview-shell {
  max-width: 420px;
}

:deep(.v-btn-toggle) {
  overflow: hidden;
}

:deep(.v-btn-toggle .v-btn) {
  text-transform: none;
}

:deep(.v-theme--dark) .image-source-input {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(36, 32, 29, 0.76);
}
</style>
