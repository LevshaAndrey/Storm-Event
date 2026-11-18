export function formFromIntent(intent, base) {
  if (!intent) return base
  const domains = Array.isArray(intent.domains) ? [...intent.domains] : base.domains

  return {
    ...base,
    from: intent.route?.from?.name || base.from,
    fromId: intent.route?.from?.id || null,
    to: intent.route?.to?.name || base.to,
    toId: intent.route?.to?.id || null,
    dateFrom: intent.dates?.from || base.dateFrom,
    dateTo: intent.dates?.to || base.dateTo,
    adults: intent.passenger?.adults ?? base.adults,
    children: intent.passenger?.children ?? base.children,
    budgetMax:
      intent.preferences?.budgetMax == null ? '' : String(intent.preferences.budgetMax),
    sort: intent.preferences?.sort || base.sort,
    domains: domains?.length ? domains : base.domains,
    directOnly: Boolean(intent.transport?.directOnly ?? base.directOnly),
    eventQuery: intent.event?.query || '',
    eventCategories: Array.isArray(intent.event?.categories)
      ? [...intent.event.categories]
      : [],
    eventVenue: intent.event?.location?.venue || '',
    eventCity: intent.event?.location?.city || '',
    eventRegion: intent.event?.location?.region || '',
    eventCountry: intent.event?.location?.country || '',
    minHotelRating: intent.hotel?.minRating || null
  }
}
