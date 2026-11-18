import { useEffect, useState } from 'react'
import { Icon } from '../icons.jsx'
import { fetchWeather } from '../weather.js'

export function WeatherChip({ city, date }) {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    if (!city || !date) {
      setWeather(null)
      return undefined
    }
    const controller = new AbortController()
    let cancelled = false
    fetchWeather(city, date, controller.signal)
      .then((value) => {
        if (!cancelled) setWeather(value)
      })
      .catch(() => {
        if (!cancelled) setWeather(null)
      })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [city, date])

  if (!weather) return null

  const temperature = `${weather.max > 0 ? '+' : ''}${weather.max}°`
  return (
    <span className="weather-chip" title={`${weather.label}, ночью ${weather.min}°`}>
      <Icon name="sun" size={13} />
      {temperature}
      <span>{weather.label}</span>
    </span>
  )
}
