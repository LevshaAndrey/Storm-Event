import { VanArt } from '../icons.jsx'

export function SplashScreen({ leaving = false }) {
  return (
    <div className={`splash ${leaving ? 'is-leaving' : ''}`} aria-hidden="true">
      <VanArt className="splash-van" />
      <div className="splash-copy">
        <b>Storm Trip</b>
        <small>транспорт · события · отели</small>
      </div>
      <div className="splash-bar">
        <i />
      </div>
    </div>
  )
}
