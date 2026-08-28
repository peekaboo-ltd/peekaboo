interface ServicesVolumeVisualProps {
  planCount?: number;
  cadenceLabel?: string;
}

/**
 * Pricing hero visual: volume bands as a rising staircase, not a generic chart.
 * Monochrome like HeroRouteCard so it reads at a glance without decoration.
 */
const ServicesVolumeVisual = ({
  planCount = 3,
  cadenceLabel = 'Monthly · Weekly',
}: ServicesVolumeVisualProps) => (
  <figure className="relative isolate w-full overflow-hidden rounded-md bg-(--surface)">
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-label="Volume-based pricing bands increasing with delivery volume"
      className="block h-auto w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="var(--line)" strokeWidth="1">
        {[28, 64, 100, 136, 172, 208, 244, 280, 316, 348].map((y) => (
          <line key={`h-${y}`} x1="0" y1={y} x2="480" y2={y} />
        ))}
        {[36, 84, 132, 180, 228, 276, 324, 372, 420].map((x) => (
          <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="360" />
        ))}
      </g>

      {[
        { x: 72, height: 72, label: 'Starter' },
        { x: 168, height: 120, label: 'Growth' },
        { x: 264, height: 168, label: 'Scale' },
        { x: 360, height: 216, label: 'Enterprise' },
      ].slice(0, Math.max(2, Math.min(planCount, 4))).map((band) => (
        <g key={band.label}>
          <rect
            x={band.x}
            y={320 - band.height}
            width="72"
            height={band.height}
            fill="var(--paper)"
            stroke="var(--ink)"
            strokeWidth="2"
          />
          <text
            x={band.x + 36}
            y={320 - band.height - 10}
            textAnchor="middle"
            fill="var(--muted)"
            fontSize="11"
            fontFamily="inherit"
          >
            {band.label}
          </text>
        </g>
      ))}

      <path
        d="M 48 300 L 432 108"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.5"
        strokeDasharray="5 5"
        opacity="0.35"
      />
    </svg>

    <figcaption className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-(--radius-control) bg-(--paper) px-4 py-3">
      <span className="text-sm font-normal text-(--ink)">Your band. Your rate.</span>
      <span className="shrink-0 text-sm text-(--muted)">{cadenceLabel}</span>
    </figcaption>
  </figure>
);

export default ServicesVolumeVisual;
