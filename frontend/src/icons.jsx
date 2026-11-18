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
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9h17M3.5 15h17M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21M12 3C9.6 5.5 8.4 8.5 8.4 12s1.2 6.5 3.6 9" />
    </>
  ),
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
  ),
  van: (
    <>
      <rect x="2.5" y="5.5" width="19" height="11.5" rx="2.5" />
      <rect x="5" y="7.5" width="14" height="3.6" rx="1.2" />
      <path d="M2.5 9H1.2M21.5 9h1.3" />
      <path d="M5 14h2.5M16.5 14h2.5" />
      <path d="M10.4 13.2h3.2M10.4 15.4h3.2" />
      <path d="M7 17v1.6M17 17v1.6" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9.5a6 6 0 1 0-12 0c0 4.6-1.8 5.8-1.8 5.8h15.6S18 14.1 18 9.5Z" />
      <path d="M10.2 19a2.1 2.1 0 0 0 3.6 0" />
    </>
  ),
  moon: <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" />
    </>
  ),
  chat: (
    <>
      <path d="M20.5 11.5a8.5 8.5 0 0 1-12.3 7.6L3.5 20.5l1.4-4.6A8.5 8.5 0 1 1 20.5 11.5Z" />
      <path d="M8 10h8M8 13.5h5" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" />
    </>
  ),
  filter: (
    <>
      <path d="M3.5 6h17M6.5 12h11M10 18h4" />
      <circle cx="8" cy="6" r="1.8" />
      <circle cx="15" cy="12" r="1.8" />
      <circle cx="12" cy="18" r="1.8" />
    </>
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
    </>
  ),
  calendarPlus: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4M12 13v6M9 16h6" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13.5h9L17.5 7" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M4 20h16" />
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
      <Icon name="van" size={small ? 20 : 24} strokeWidth={1.7} />
    </span>
  )
}

export function VanArt({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 480 300" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="vanBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d4f46" />
          <stop offset="1" stopColor="#1c2a23" />
        </linearGradient>
        <linearGradient id="vanGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#123028" />
          <stop offset="0.55" stopColor="#0f2a2a" />
          <stop offset="1" stopColor="#0b1f19" />
        </linearGradient>
      </defs>
      <ellipse className="van-ground" cx="240" cy="288" rx="162" ry="11" fill="rgba(52, 211, 153, 0.2)" />
      <rect x="76" y="272" width="56" height="20" rx="9" fill="#0a0f0c" />
      <rect x="348" y="272" width="56" height="20" rx="9" fill="#0a0f0c" />
      <rect x="14" y="98" width="30" height="44" rx="11" fill="#26362e" />
      <rect x="436" y="98" width="30" height="44" rx="11" fill="#26362e" />
      <rect x="40" y="112" width="18" height="12" rx="5" fill="#26362e" />
      <rect x="422" y="112" width="18" height="12" rx="5" fill="#26362e" />
      <rect x="52" y="42" width="376" height="208" rx="48" fill="url(#vanBody)" />
      <rect x="84" y="66" width="312" height="86" rx="24" fill="url(#vanGlass)" />
      <path d="M118 152 210 66h46L164 152Z" fill="rgba(110, 231, 183, 0.13)" />
      <path d="M244 152 336 66h14L258 152Z" fill="rgba(255, 255, 255, 0.06)" />
      <rect x="64" y="178" width="80" height="42" rx="15" fill="#e9fbf1" />
      <rect x="74" y="187" width="46" height="24" rx="11" fill="#bdf3d8" />
      <rect x="336" y="178" width="80" height="42" rx="15" fill="#e9fbf1" />
      <rect x="360" y="187" width="46" height="24" rx="11" fill="#bdf3d8" />
      <rect x="176" y="174" width="128" height="50" rx="15" fill="#101b15" stroke="rgba(255, 255, 255, 0.06)" />
      <path d="M190 190h100M190 206h100" stroke="#2a3d33" strokeWidth="5" strokeLinecap="round" />
      <path d="M247 182l-21 27h13l-7 21 23-28h-13l5-20Z" fill="#34d399" />
      <rect x="52" y="230" width="376" height="54" rx="26" fill="#0f1913" />
      <circle cx="88" cy="257" r="7" fill="#2ce2a2" opacity="0.85" />
      <circle cx="392" cy="257" r="7" fill="#2ce2a2" opacity="0.85" />
      <rect x="203" y="243" width="74" height="27" rx="7" fill="#e6f1ea" />
      <path d="M213 256h30M250 256h17" stroke="#3a5a4c" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
