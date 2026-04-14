<template>
  <v-container class="py-10" style="max-width: 520px;">
    <v-card rounded="xl" class="pa-6">
      <h2 class="text-h6 mb-4">Ieiet</h2>
      <AlertMessage v-if="formError" type="error" :message="formError" />
      <AlertMessage v-if="auth.error" type="error" :message="auth.error" />

      <v-form @submit.prevent="submit">
        <v-text-field
          v-model="form.email"
          label="E-pasts"
          :error-messages="emailErrors"
        />
        <v-text-field
          v-model="form.password"
          label="Parole"
          type="password"
          :error-messages="passwordErrors"
        />
        <v-btn color="primary" type="submit" block class="mt-4">Ieiet</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { reactive, computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { email, required } from '@vuelidate/validators'
import { useAuthStore } from '../stores/auth'
import AlertMessage from '../components/AlertMessage.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const formError = ref('')

const form = reactive({
  email: '',
  password: '',
})

const rules = {
  email: { required, email },
  password: { required },
}

const v$ = useVuelidate(rules, form)

const emailErrors = computed(() => {
  const errors = []
  if (!v$.value.email.$dirty) return errors
  if (!v$.value.email.required) errors.push('E-pasts ir obligāts.')
  if (!v$.value.email.email) errors.push('Ievadiet korektu e-pasta adresi.')
  return errors
})

const passwordErrors = computed(() => {
  const errors = []
  if (!v$.value.password.$dirty) return errors
  if (!v$.value.password.required) errors.push('Parole ir obligāta.')
  return errors
})

async function submit() {
  auth.clearError()
  formError.value = ''
  v$.value.$touch()
  if (v$.value.$invalid) {
    formError.value = 'Lūdzu, pārbaudiet ievadītos laukus.'
    return
  }
  try {
    await auth.login({ email: form.email, password: form.password })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    if (redirect) {
      router.push(redirect)
    } else {
      router.push({ name: 'home' })
    }
  } catch {
    // Error text is set in auth store and displayed via AlertMessage.
  }
}

onMounted(() => {
  auth.clearError()
  formError.value = ''
})

watch(form, () => {
  if (formError.value) formError.value = ''
}, { deep: true })
</script>
