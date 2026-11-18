const HISTORY_KEY = 'storm-trip.history.v1'
const MAX_HISTORY = 10
const MAX_STORED_OFFERS = 40
const MAX_STORED_ROUTES = 12
const MAX_STORED_COMBINATIONS = 12

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function trimResult(result) {
  if (!result) return null
  return {
    intent: result.intent || null,
    offers: (result.offers || []).slice(0, MAX_STORED_OFFERS),
    itineraries: (result.itineraries || []).slice(0, MAX_STORED_ROUTES),
    combinations: (result.combinations || []).slice(0, MAX_STORED_COMBINATIONS),
    sources: result.sources || []
  }
}

function signature(form) {
  return JSON.stringify({
    from: form?.from || '',
    to: form?.to || '',
    dateFrom: form?.dateFrom || '',
    dateTo: form?.dateTo || '',
    adults: Number(form?.adults) || 1,
    children: Number(form?.children) || 0,
    budgetMax: form?.budgetMax || '',
    sort: form?.sort || 'BEST',
    domains: [...(form?.domains || [])].sort(),
    directOnly: Boolean(form?.directOnly),
    eventQuery: form?.eventQuery || '',
    eventCategories: [...(form?.eventCategories || [])].sort(),
    minHotelRating: form?.minHotelRating || null
  })
}

export function loadHistory() {
  const stored = readJson(HISTORY_KEY, [])
  if (!Array.isArray(stored)) return []
  return stored.filter((entry) => entry && entry.id && entry.form && entry.result).slice(0, MAX_HISTORY)
}

export function saveHistory(entries) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)))
  } catch {
    /* storage may be full or unavailable */
  }
}

export function createHistoryEntry(form, result) {
  const createdAt = Date.now()
  return {
    id: `trip-${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt,
    form: { ...form },
    result: trimResult(result)
  }
}

export function mergeHistory(entries, entry) {
  if (!entry) return entries
  const next = signature(entry.form)
  const withoutDuplicate = entries.filter((item) => signature(item.form) !== next)
  return [entry, ...withoutDuplicate].slice(0, MAX_HISTORY)
}

export function removeHistoryEntry(entries, id) {
  return entries.filter((entry) => entry.id !== id)
}

export function clearHistoryEntries() {
  return []
}

export function historyPrice(entry) {
  const combinations = entry?.result?.combinations || []
  const prices = combinations
    .map((combination) => Number(combination?.totalPrice?.amount))
    .filter((value) => Number.isFinite(value) && value > 0)
  if (!prices.length) {
    const offers = entry?.result?.offers || []
    const offerPrices = offers
      .map((offer) => Number(offer?.price?.amount))
      .filter((value) => Number.isFinite(value) && value > 0)
    if (!offerPrices.length) return null
    return Math.min(...offerPrices)
  }
  return Math.min(...prices)
}

export function historySignature(form) {
  return signature(form)
}
