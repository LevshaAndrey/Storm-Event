const icons = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c.5-4 2.8-6 5.5-6s5 2 5.5 6" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8M17.5 14.5c2 .6 3.2 2.5 3.5 5.5" />
    </>
  ),
  arrowRight: <path d="M4 12h15M13 6l6 6-6 6" />,
  arrowLeft: <path d="M20 12H5M11 6l-6 6 6 6" />,
  swap: (
    <>
      <path d="M7 4 3 8l4 4M3 8h13a4 4 0 0 1 4 4" />
      <path d="m17 20 4-4-4-4M21 16H8a4 4 0 0 1-4-4" />
    </>
  ),
  train: (
    <>
      <rect x="5" y="3.5" width="14" height="13" rx="3" />
      <path d="M5 10h14" />
      <circle cx="9" cy="13.5" r=".9" />
      <circle cx="15" cy="13.5" r=".9" />
      <path d="M8.5 16.5 6 21M15.5 16.5 18 21" />
    </>
  ),
  bus: (
    <>
      <rect x="4" y="3.5" width="16" height="13" rx="3" />
      <path d="M4 10h16M7 16.5V19M17 16.5V19" />
      <circle cx="8.5" cy="19.5" r="1.4" />
      <circle cx="15.5" cy="19.5" r="1.4" />
    </>
  ),
  ticket: (
    <>
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.5a2.5 2.5 0 0 0 0 5V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5a2.5 2.5 0 0 0 0-5Z" />
      <path d="M14 6v12" strokeDasharray="2.5 2.5" />
    </>
  ),
  hotel: (
    <>
      <path d="M4 20V9h16v11M4 14h16" />
      <circle cx="8" cy="11.5" r="1.3" />
      <path d="M4 20v-2M20 20v-2" />
    </>
  ),
  tune: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9Z" />,
  spark: (
    <>
      <path d="M12 3.5 13.5 9 19 10.5 13.5 12 12 17.5 10.5 12 5 10.5 10.5 9Z" />
      <path d="m18.5 16 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7Z" />
    </>
  ),
  route: (
    <>
      <circle cx="5.5" cy="6" r="2.3" />
      <circle cx="18.5" cy="18" r="2.3" />
      <path d="M7.8 6h5.7a3.5 3.5 0 0 1 0 7H9a3.5 3.5 0 0 0 0 7h7.2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 7.8h.01" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  external: (
    <>
      <path d="M14 4h6v6M20 4l-8 8" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  map: (
    <>
      <path d="m9 4-5.5 2v14L9 18l6 2 5.5-2V4L15 6Z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  walk: (
    <>
      <circle cx="13" cy="4.5" r="2" />
      <path d="m11 21 2-6-3-3 2-5 3 4 4 1M9 13l-2 4" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="14.5" r="1" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-2.2 5.5" />
      <path d="M20 5v6h-6" />
    </>
  )
}

export function Icon({ name, size = 20, className = '', strokeWidth = 1.8 }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name] || icons.info}
    </svg>
  )
}

export function Logo({ small = false }) {
  return (
    <span className={`logo ${small ? 'logo-small' : ''}`} aria-hidden="true">
      <Icon name="route" size={small ? 18 : 22} strokeWidth={2.1} />
    </span>
  )
}
