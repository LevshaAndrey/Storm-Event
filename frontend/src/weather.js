const CACHE_PREFIX = 'storm-trip.weather.v1:'
const CACHE_TTL = 60 * 60 * 1000

const WEATHER_LABELS = {
  0: 'ясно',
  1: 'почти ясно',
  2: 'переменная облачность',
  3: 'облачно',
  45: 'туман',
  48: 'изморозь',
  51: 'морось',
  53: 'морось',
  55: 'морось',
  56: 'ледяная морось',
  57: 'ледяная морось',
  61: 'дождь',
  63: 'дождь',
  65: 'сильный дождь',
  66: 'ледяной дождь',
  67: 'ледяной дождь',
  71: 'снег',
  73: 'снег',
  75: 'сильный снег',
  77: 'снежная крупа',
  80: 'ливень',
  81: 'ливень',
  82: 'сильный ливень',
  85: 'снегопад',
  86: 'снегопад',
  95: 'гроза',
  96: 'гроза с градом',
  99: 'гроза с градом'
}

function readCache(key) {
  try {
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.at || Date.now() - parsed.at > CACHE_TTL) return null
    return parsed.value
  } catch {
    return null
  }
}

function writeCache(key, value) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), value }))
  } catch {
    /* cache is optional */
  }
}

async function geocode(city, signal) {
  const base = 'https://geocoding-api.open-meteo.com/v1/search'
  const common = `name=${encodeURIComponent(city)}&count=1&language=ru&format=json`
  const attempts = [`${base}?${common}&countryCode=BY`, `${base}?${common}`]
  for (const url of attempts) {
    const response = await fetch(url, { signal })
    if (!response.ok) continue
    const data = await response.json()
    const result = data?.results?.[0]
    if (result) return result
  }
  return null
}

export async function fetchWeather(city, date, signal) {
  if (!city || !date) return null
  const key = `${CACHE_PREFIX}${city.toLowerCase()}:${date}`
  const cached = readCache(key)
  if (cached) return cached

  const place = await geocode(city, signal)
  if (!place) return null

  const forecastUrl =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${place.latitude}&longitude=${place.longitude}` +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
    '&timezone=auto&forecast_days=16'
  const response = await fetch(forecastUrl, { signal })
  if (!response.ok) return null
  const data = await response.json()
  const days = data?.daily
  const index = days?.time?.indexOf(date) ?? -1
  if (index < 0) return null

  const code = Number(days.weather_code?.[index])
  const value = {
    max: Math.round(Number(days.temperature_2m_max?.[index])),
    min: Math.round(Number(days.temperature_2m_min?.[index])),
    precipitation: Number(days.precipitation_probability_max?.[index]) || 0,
    label: WEATHER_LABELS[code] || 'без осадков',
    city: place.name,
    country: place.country_code
  }
  writeCache(key, value)
  return value
}
