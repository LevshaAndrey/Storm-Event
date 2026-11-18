export const SETTINGS_KEY = 'storm-trip.settings.v1'

export const defaultSettings = {
  theme: 'dark',
  haptics: true,
  pushEnabled: false,
  pushOnResults: true
}

export function loadSettings() {
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY)
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : { ...defaultSettings }
  } catch {
    return { ...defaultSettings }
  }
}

export function saveSettings(settings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    /* storage may be unavailable */
  }
}

export function resolveTheme(theme) {
  if (theme === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: light)')?.matches ? 'light' : 'dark'
  }
  return theme === 'light' ? 'light' : 'dark'
}

export function applyTheme(theme) {
  const next = resolveTheme(theme)
  document.documentElement.dataset.theme = next
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', next === 'dark' ? '#0d1310' : '#f4f7f5')
}
