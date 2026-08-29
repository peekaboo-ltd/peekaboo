interface HeroRouteCardProps {
  etaLabel?: string;
  statusLabel?: string;
}

/**
 * The hero's product visual: a route in Kigali rendered the way the tracking
 * screen renders it. Monochrome by construction, so it needs no color to read.
 */
const HeroRouteCard = ({
  etaLabel = '12 min away',
  statusLabel = 'Rider on the way',
}: HeroRouteCardProps) => (
  <figure className="relative isolate w-full overflow-hidden rounded-md bg-(--surface)">
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-label="Delivery route from Kacyiru to Nyamirambo, rider currently in transit"
      className="block h-auto w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Street grid */}
      <g stroke="var(--line)" strokeWidth="1">
        {[28, 64, 100, 136, 172, 208, 244, 280, 316, 348].map((y) => (
          <line key={`h-${y}`} x1="0" y1={y} x2="480" y2={y} />
        ))}
        {[36, 84, 132, 180, 228, 276, 324, 372, 420].map((x) => (
          <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="360" />
        ))}
      </g>

      {/* Arterial roads, one diagonal, so the grid does not read as a table */}
      <g stroke="var(--surface-hover)" strokeWidth="7" strokeLinecap="round">
        <line x1="0" y1="244" x2="480" y2="244" />
        <line x1="324" y1="0" x2="324" y2="360" />
        <line x1="-10" y1="70" x2="250" y2="360" />
      </g>

      {/* Route corridor */}
      <path
        d="M 68 296 C 132 288, 156 236, 218 214 C 286 190, 340 156, 402 96"
        fill="none"
        stroke="var(--paper)"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path
        d="M 68 296 C 132 288, 156 236, 218 214 C 286 190, 340 156, 402 96"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="7 6"
      />

      {/* Pickup */}
      <circle cx="68" cy="296" r="8" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.5" />
      {/* Drop-off */}
      <rect x="394" y="88" width="16" height="16" rx="2" fill="var(--ink)" />

      {/* Rider, mid-route */}
      <circle cx="218" cy="214" r="15" fill="var(--ink)" />
      <circle cx="218" cy="214" r="4.5" fill="var(--paper)" />
    </svg>

    <figcaption className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-(--radius-control) bg-(--paper) px-4 py-3">
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="size-2 shrink-0 rounded-full bg-(--ink)" aria-hidden="true" />
        <span className="truncate text-sm font-normal text-(--ink)">{statusLabel}</span>
      </span>
      <span className="shrink-0 text-sm text-(--muted) tabular">{etaLabel}</span>
    </figcaption>
  </figure>
);

export default HeroRouteCard;
