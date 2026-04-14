import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { vuetify } from './plugins/vuetify'
import { applyBrandingCssVars } from './config/uiTheme'
import '@mdi/font/css/materialdesignicons.css'
import './styles/premium-light.css'
import './styles/premium-dark.css'
import './styles/app.css'

const pinia = createPinia()

applyBrandingCssVars()

createApp(App)
  .use(pinia)
  .use(router)
  .use(vuetify)
  .mount('#app')

