interface RoutePreviewMapProps {
  className?: string;
  dark?: boolean;
}

const RoutePreviewMap = ({ className = '', dark = false }: RoutePreviewMapProps) => (
  <svg
    viewBox="0 0 160 72"
    role="img"
    aria-label="Live delivery route preview from Kacyiru to Nyamirambo"
    className={className}
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <linearGradient id="route-fill" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={dark ? 'rgba(255,196,0,0.08)' : 'rgba(255,196,0,0.12)'} />
        <stop offset="100%" stopColor={dark ? 'rgba(255,196,0,0.02)' : 'rgba(255,196,0,0.04)'} />
      </linearGradient>
    </defs>

    <rect
      width="160"
      height="72"
      rx="8"
      fill={dark ? 'rgba(255,255,255,0.04)' : '#f7f6f1'}
    />

    {/* Grid */}
    {[16, 32, 48, 56, 64].map((y) => (
      <line
        key={`h-${y}`}
        x1="8"
        y1={y}
        x2="152"
        y2={y}
        stroke={dark ? 'rgba(255,255,255,0.06)' : 'rgba(10,10,10,0.05)'}
        strokeWidth="0.5"
      />
    ))}
    {[32, 64, 96, 128].map((x) => (
      <line
        key={`v-${x}`}
        x1={x}
        y1="8"
        x2={x}
        y2="64"
        stroke={dark ? 'rgba(255,255,255,0.06)' : 'rgba(10,10,10,0.05)'}
        strokeWidth="0.5"
      />
    ))}

    {/* Route corridor */}
    <path
      d="M 24 48 C 48 44, 72 28, 108 22 C 124 20, 136 26, 140 34"
      fill="none"
      stroke="url(#route-fill)"
      strokeWidth="14"
      strokeLinecap="round"
    />

    {/* Active route */}
    <path
      d="M 24 48 C 48 44, 72 28, 108 22 C 124 20, 136 26, 140 34"
      fill="none"
      stroke="#edb100"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="4 3"
    />

    {/* Pickup */}
    <circle cx="24" cy="48" r="5" fill={dark ? '#0a0a0a' : '#fff'} stroke="#edb100" strokeWidth="2" />
    <text
      x="24"
      y="62"
      textAnchor="middle"
      fontSize="7"
      fontWeight="600"
      fill={dark ? 'rgba(255,255,255,0.7)' : '#6b6f76'}
      fontFamily="system-ui, sans-serif"
    >
      Kacyiru
    </text>

    {/* Drop-off */}
    <circle cx="140" cy="34" r="5" fill="#edb100" stroke={dark ? '#0a0a0a' : '#fff'} strokeWidth="1.5" />
    <text
      x="140"
      y="62"
      textAnchor="middle"
      fontSize="7"
      fontWeight="600"
      fill={dark ? 'rgba(255,255,255,0.7)' : '#6b6f76'}
      fontFamily="system-ui, sans-serif"
    >
      Nyamirambo
    </text>

    {/* Rider dot */}
    <circle cx="88" cy="26" r="3.5" fill="#0a0a0a">
      <animate
        attributeName="cx"
        values="24;88;140"
        dur="4s"
        repeatCount="indefinite"
        calcMode="spline"
      />
      <animate
        attributeName="cy"
        values="48;26;34"
        dur="4s"
        repeatCount="indefinite"
        calcMode="spline"
      />
    </circle>
  </svg>
);

export default RoutePreviewMap;
