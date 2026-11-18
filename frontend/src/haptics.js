let enabled = true

export function configureHaptics(value) {
  enabled = Boolean(value)
}

export function haptic(pattern = 8) {
  if (!enabled) return
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* vibration may be unavailable */
  }
}
