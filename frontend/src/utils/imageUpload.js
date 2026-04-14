export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

export function detectImageInputMode({ url = '', file = null, existingUrl = '' } = {}) {
  if (file) return 'file'
  if (String(url || '').trim() || String(existingUrl || '').trim()) return 'url'
  return 'file'
}

export function validateImageUrl(url) {
  const normalized = String(url || '').trim()
  if (!normalized) return []

  try {
    const parsed = new URL(normalized)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ['Norādiet derīgu attēla URL ar http vai https.']
    }
  } catch {
    return ['Norādiet derīgu attēla URL.']
  }

  return []
}

export function validateImageFile(file) {
  if (!file) return []

  const errors = []
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    errors.push('Atbalstīti formāti: JPG, PNG, WEBP vai GIF.')
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    errors.push('Fails nedrīkst būt lielāks par 5 MB.')
  }
  return errors
}
