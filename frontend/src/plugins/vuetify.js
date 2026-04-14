import 'vuetify/styles'
import { createVuetify } from 'vuetify'

const THEME_KEY = 'kg_theme'

export function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  return saved === 'dark' ? 'dark' : 'light'
}

export function setSavedTheme(themeName) {
  localStorage.setItem(THEME_KEY, themeName)
}

export const vuetify = createVuetify({
  theme: {
    defaultTheme: getInitialTheme(),
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#F8F6F3',
          surface: '#FFFFFF',
          'surface-variant': '#F2EEE9',
          'surface-bright': '#FFFFFF',
          primary: '#E67E22',
          secondary: '#6B6B6B',
          info: '#2563EB',
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
          'on-background': '#1F1F1F',
          'on-surface': '#1F1F1F',
        },
        variables: {
          'border-color': 'rgba(0,0,0,0.05)',
          'high-emphasis-opacity': 0.9,
          'medium-emphasis-opacity': 0.7,
          'disabled-opacity': 0.38,
        },
      },
      dark: {
        dark: true,
        colors: {
          background: '#171513',
          surface: '#24201D',
          'surface-variant': '#2D2723',
          'surface-bright': '#37302C',
          primary: '#E67E22',
          secondary: '#A6A6A6',
          info: '#60A5FA',
          success: '#22C55E',
          warning: '#EAB308',
          error: '#F87171',
          'on-background': '#F7F3EE',
          'on-surface': '#F7F3EE',
        },
        variables: {
          'border-color': 'rgba(255,255,255,0.08)',
          'high-emphasis-opacity': 0.9,
          'medium-emphasis-opacity': 0.74,
          'disabled-opacity': 0.44,
        },
      },
    },
  },
})

export { THEME_KEY }

