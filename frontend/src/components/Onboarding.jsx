import { useState } from 'react'
import { haptic } from '../haptics.js'
import { Icon } from '../icons.jsx'

const slides = [
  {
    icon: 'route',
    eyebrow: 'пять источников',
    title: 'Один маршрут вместо пяти вкладок',
    text: 'AtlasBus, БЖД, TicketBus, TicketPro и BelHotel. Собираем транспорт, событие и отель в готовые варианты.'
  },
  {
    icon: 'spark',
    eyebrow: 'по-человечески',
    title: 'Спросите словами',
    text: '«Из Минска в Брест на выходные до 300 BYN». Потом уточняйте: «дешевле», «без автобуса», «отель 4★».'
  },
  {
    icon: 'bell',
    eyebrow: 'как приложение',
    title: 'История, уведомления и офлайн',
    text: 'Установите на экран «Домой». Поездки сохраняются на устройстве, а уведомление придёт, когда маршрут собран.'
  }
]

export function Onboarding({ open, onDone }) {
  const [index, setIndex] = useState(0)
  if (!open) return null

  const slide = slides[index]
  const last = index === slides.length - 1

  function next() {
    haptic(8)
    if (last) {
      onDone?.()
      setIndex(0)
    } else {
      setIndex((value) => value + 1)
    }
  }

  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-label="Знакомство с приложением">
      <div className="onboarding-card">
        <button
          type="button"
          className="onboarding-skip"
          onClick={() => {
            setIndex(0)
            onDone?.()
          }}
        >
          Пропустить
        </button>

        <span className="onboarding-icon"><Icon name={slide.icon} size={34} /></span>
        <span className="eyebrow">{slide.eyebrow}</span>
        <h2>{slide.title}</h2>
        <p>{slide.text}</p>

        <div className="onboarding-dots" aria-hidden="true">
          {slides.map((item, dot) => (
            <i key={item.title} className={dot === index ? 'is-active' : ''} />
          ))}
        </div>

        <button type="button" className="btn btn-primary btn-block" onClick={next}>
          {last ? 'Поехали' : 'Далее'}
          <Icon name={last ? 'check' : 'arrowRight'} size={18} />
        </button>
      </div>
    </div>
  )
}
