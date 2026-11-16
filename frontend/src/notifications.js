export function pushSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function currentPermission() {
  return pushSupported() ? Notification.permission : 'unsupported'
}

export async function requestPushPermission() {
  if (!pushSupported()) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

export async function showPush(title, body) {
  if (!pushSupported() || Notification.permission !== 'granted') return false
  const options = {
    body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    lang: 'ru',
    tag: 'storm-trip'
  }
  try {
    const registration = await navigator.serviceWorker?.getRegistration?.()
    if (registration) {
      await registration.showNotification(title, options)
      return true
    }
    new Notification(title, options)
    return true
  } catch {
    return false
  }
}
