const JSON_HEADERS = { 'Content-Type': 'application/json' }

async function request(path, options = {}) {
  const response = await fetch(path, options)
  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }
  if (!response.ok) {
    const message = typeof data === 'string' ? data : data?.reply || data?.message
    throw new Error(message || `Сервис ответил ошибкой ${response.status}`)
  }
  return data
}

export const api = {
  localities(query) {
    return request(`/api/localities?query=${encodeURIComponent(query)}&limit=10`)
  },

  eventCategories() {
    return request('/api/event-categories')
  },

  events({ category, query, limit = 16 } = {}) {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (query) params.set('query', query)
    params.set('limit', String(limit))
    return request(`/api/events?${params.toString()}`)
  },

  search(payload) {
    return request('/api/search', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(payload)
    })
  },

  chat({ message, userId }) {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 120000)
    return request('/api/chat/json', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ message, userId }),
      signal: controller.signal
    }).finally(() => window.clearTimeout(timer))
  }
}
