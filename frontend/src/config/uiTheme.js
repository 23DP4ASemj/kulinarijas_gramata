export const uiTheme = {
  appName: 'Kulinārijas Grāmata',
  logo: {
    src: '/assets/logo.png',
    alt: 'Kulinārijas Grāmata logo',
    height: '72px',
    mobileHeight: '52px',
  },
  background: {
    image: '/assets/body.png',
    position: 'center top',
    size: '520px auto',
    repeat: 'repeat',
    attachment: 'scroll',
  },
  overlay: {
    light: 'linear-gradient(180deg, rgba(248, 246, 243, 0.2), rgba(248, 246, 243, 0.12))',
    dark: 'linear-gradient(180deg, rgba(23, 21, 19, 0.46), rgba(23, 21, 19, 0.36))',
  },
}

export function applyBrandingCssVars(target = document.documentElement) {
  target.style.setProperty('--kg-body-image', `url("${uiTheme.background.image}")`)
  target.style.setProperty('--kg-body-position', uiTheme.background.position)
  target.style.setProperty('--kg-body-size', uiTheme.background.size)
  target.style.setProperty('--kg-body-repeat', uiTheme.background.repeat)
  target.style.setProperty('--kg-body-attachment', uiTheme.background.attachment)
  target.style.setProperty('--kg-body-overlay-light', uiTheme.overlay.light)
  target.style.setProperty('--kg-body-overlay-dark', uiTheme.overlay.dark)
  target.style.setProperty('--kg-logo-height', uiTheme.logo.height)
  target.style.setProperty('--kg-logo-height-mobile', uiTheme.logo.mobileHeight)
}
