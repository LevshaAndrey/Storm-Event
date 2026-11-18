import { useEffect, useState } from 'react'
import { Icon } from '../icons.jsx'

const DISMISS_KEY = 'storm-trip.install-dismissed.v1'

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator.standalone === true
  )
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export function InstallBanner() {
  const [prompt, setPrompt] = useState(null)
  const [installed, setInstalled] = useState(isStandalone)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault()
      setPrompt(event)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  function close() {
    setDismissed(true)
    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* optional */
    }
  }

  async function install() {
    if (!prompt) return
    prompt.prompt()
    const choice = await prompt.userChoice
    if (choice?.outcome === 'accepted') {
      setInstalled(true)
    } else {
      close()
    }
    setPrompt(null)
  }

  if (installed || dismissed) return null

  if (prompt) {
    return (
      <div className="install-banner">
        <span className="install-icon"><Icon name="download" size={18} /></span>
        <div>
          <b>Установить Storm Trip</b>
          <small>На экран «Домой» — без адресной строки</small>
        </div>
        <button type="button" className="btn btn-soft btn-small" onClick={install}>
          Установить
        </button>
        <button type="button" className="install-close" onClick={close} aria-label="Скрыть">
          <Icon name="x" size={14} />
        </button>
      </div>
    )
  }

  if (isIOS()) {
    return (
      <div className="install-banner">
        <span className="install-icon"><Icon name="share" size={18} /></span>
        <div>
          <b>Добавить на экран «Домой»</b>
          <small>Поделиться → На экран «Домой»</small>
        </div>
        <button type="button" className="install-close" onClick={close} aria-label="Скрыть">
          <Icon name="x" size={14} />
        </button>
      </div>
    )
  }

  return null
}
