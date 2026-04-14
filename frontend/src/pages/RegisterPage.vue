<template>
  <v-container class="py-10" style="max-width: 520px;">
    <v-card rounded="xl" class="pa-6">
      <h2 class="text-h6 mb-4">Reģistrācija</h2>
      <AlertMessage v-if="formError" type="error" :message="formError" />
      <AlertMessage v-if="auth.error" type="error" :message="auth.error" />
      <AlertMessage v-if="successMessage" type="success" :message="successMessage" />

      <v-form @submit.prevent="submit">
        <v-text-field v-model="form.name" label="Vārds" :error-messages="nameErrors" />
        <v-text-field v-model="form.email" label="E-pasts" :error-messages="emailErrors" />
        <v-text-field
          v-model="form.password"
          label="Parole"
          type="password"
          :error-messages="passwordErrors"
        />
        <v-text-field
          v-model="form.password_confirmation"
          label="Apstiprināt paroli"
          type="password"
          :error-messages="confirmErrors"
        />
        <v-btn color="primary" type="submit" block class="mt-4">Reģistrēties</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { reactive, computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { email, required, minLength, sameAs } from '@vuelidate/validators'
import { useAuthStore } from '../stores/auth'
import AlertMessage from '../components/AlertMessage.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const successMessage = ref('')
const formError = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const rules = {
  name: { required },
  email: { required, email },
  password: { required, minLength: minLength(6) },
  password_confirmation: { required, sameAs: sameAs(computed(() => form.password)) },
}

const v$ = useVuelidate(rules, form)

const nameErrors = computed(() => {
  const errors = []
  if (!v$.value.name.$dirty) return errors
  if (!v$.value.name.required) errors.push('Vārds ir obligāts.')
  return errors
})

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
  if (!v$.value.password.minLength) errors.push('Parolei jābūt vismaz 6 rakstzīmēm.')
  return errors
})

const confirmErrors = computed(() => {
  const errors = []
  if (!v$.value.password_confirmation.$dirty) return errors
  if (!v$.value.password_confirmation.required) errors.push('Paroles apstiprinājums ir obligāts.')
  if (!v$.value.password_confirmation.sameAs) errors.push('Paroles nesakrīt.')
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
    await auth.register({
      name: form.name,
      email: form.email,
      password: form.password,
      password_confirmation: form.password_confirmation,
    })
    successMessage.value = 'Reģistrācija veiksmīga.'
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
