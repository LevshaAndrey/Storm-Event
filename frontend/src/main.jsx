import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import { applyTheme, loadSettings } from './settings.js'

// Тема применяется до первой отрисовки, чтобы не было вспышки неправильного фона.
applyTheme(loadSettings().theme)

createRoot(document.getElementById('root')).render(<App />)

if ('serviceWorker' in navigator) {
  const state = { applyPending: false }

  const offerUpdate = (worker) => {
    if (!worker) return
    window.dispatchEvent(
      new CustomEvent('storm-sw-update', {
        detail: {
          apply: () => {
            state.applyPending = true
            worker.postMessage({ type: 'SKIP_WAITING' })
          }
        }
      })
    )
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')

      if (registration.waiting) offerUpdate(registration.waiting)

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing
        if (!worker) return
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            offerUpdate(worker)
          }
        })
      })

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (state.applyPending) window.location.reload()
      })
    } catch {
      /* установка не критична для работы приложения */
    }
  })
}
