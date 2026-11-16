import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import { applyTheme, loadSettings } from './settings.js'

// Тема применяется до первой отрисовки, чтобы не было вспышки неправильного фона.
applyTheme(loadSettings().theme)

createRoot(document.getElementById('root')).render(<App />)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* установка не критична для работы приложения */
    })
  })
}
