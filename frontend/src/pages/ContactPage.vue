<template>
  <v-container class="page-container py-6">
    <v-card rounded="xl" class="pa-6">
      <h1 class="text-h4 mb-2">Kontakti</h1>
      <p class="text-body-1 text-medium-emphasis mb-5">
        Sazinies ar mums, ja vēlies ieteikt jaunu funkciju vai recepti.
      </p>

      <v-alert
        v-if="showInvalidAlert"
        type="error"
        variant="tonal"
        class="mb-4 shake-alert"
      >
        Lūdzu, aizpildiet visus laukus pareizi.
      </v-alert>

      <v-alert
        v-if="showSuccess"
        type="success"
        variant="tonal"
        class="mb-4"
      >
        Paldies! Ziņojums ir veiksmīgi nosūtīts.
      </v-alert>

      <v-form ref="formRef" @submit.prevent="submit">
        <v-text-field
          v-model="form.name"
          label="Vārds"
          :rules="nameRules"
          required
        />

        <v-text-field
          v-model="form.email"
          label="E-pasts"
          :rules="emailRules"
          required
        />

        <v-textarea
          v-model="form.message"
          label="Ziņojums"
          :rules="messageRules"
          rows="4"
          required
        />

        <v-btn color="primary" type="submit">Nosūtīt</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { reactive, ref } from 'vue'
const formRef = ref(null)

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const showSuccess = ref(false)
const showInvalidAlert = ref(false)

const nameRules = [
  (value) => !!value || 'Vārds ir obligāts.',
]

const emailRules = [
  (value) => !!value || 'E-pasts ir obligāts.',
  (value) => /.+@.+\..+/.test(value) || 'Ievadiet korektu e-pasta adresi.',
]

const messageRules = [
  (value) => !!value || 'Ziņojums ir obligāts.',
]

async function submit() {
  showInvalidAlert.value = false
  showSuccess.value = false

  const result = await formRef.value?.validate()
  if (!result?.valid) {
    showInvalidAlert.value = true
    return
  }

  showSuccess.value = true
  form.name = ''
  form.email = ''
  form.message = ''
  formRef.value?.resetValidation()
}
</script>

<style scoped>
.page-container {
  max-width: 760px;
}

.shake-alert {
  animation: shake 260ms ease;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  50% {
    transform: translateX(4px);
  }
  75% {
    transform: translateX(-3px);
  }
}
</style>
