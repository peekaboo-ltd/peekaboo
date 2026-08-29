interface ServicesVolumeVisualProps {
  planCount?: number;
  cadenceLabel?: string;
}

const volumeBands = [
  { x: 72, height: 72, labelKey: 'pricing.band.starter', fill: 'var(--public-band-1)', soft: 'var(--public-sky-soft)' },
  { x: 168, height: 120, labelKey: 'pricing.band.growth', fill: 'var(--public-band-2)', soft: 'var(--public-sage-soft)' },
  { x: 264, height: 168, labelKey: 'pricing.band.scale', fill: 'var(--public-band-3)', soft: 'var(--public-clay-soft)' },
  { x: 360, height: 216, labelKey: 'pricing.band.enterprise', fill: 'var(--public-band-4)', soft: 'var(--public-plum-soft)' },
] as const;

/**
 * Pricing hero visual: volume bands as a rising staircase with soft public
 * accents so each tier reads as distinct without overpowering the page.
 */
const ServicesVolumeVisual = ({
  planCount = 3,
  cadenceLabel,
}: ServicesVolumeVisualProps) => {
  const { t } = useI18n();
  return (
  <figure className="relative isolate w-full overflow-hidden rounded-md bg-(--surface)">
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-label={t('pricing.visualLabel')}
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

      {volumeBands.slice(0, Math.max(2, Math.min(planCount, 4))).map((band) => (
        <g key={band.labelKey}>
          <rect
            x={band.x}
            y={320 - band.height}
            width="72"
            height={band.height}
            fill={band.soft}
            stroke={band.fill}
            strokeWidth="2"
          />
          <rect
            x={band.x + 6}
            y={320 - band.height + 8}
            width="60"
            height={Math.max(band.height - 16, 12)}
            fill={band.fill}
            opacity="0.22"
            rx="2"
          />
          <text
            x={band.x + 36}
            y={320 - band.height - 10}
            textAnchor="middle"
            fill={band.fill}
            fontSize="11"
            fontFamily="inherit"
          >
            {t(band.labelKey)}
          </text>
        </g>
      ))}

      <defs>
        <linearGradient id="volume-trend" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--public-band-1)" stopOpacity="0.5" />
          <stop offset="50%" stopColor="var(--public-band-2)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--public-band-4)" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      <path
        d="M 48 300 L 432 108"
        fill="none"
        stroke="url(#volume-trend)"
        strokeWidth="2"
        strokeDasharray="6 5"
      />
    </svg>

    <figcaption className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-(--radius-control) bg-(--paper) px-4 py-3">
      <span className="text-sm font-normal text-(--ink)">{t('pricing.yourBand')}</span>
      <span className="shrink-0 text-sm text-(--muted)">{cadenceLabel ?? t('services.defaultCadence')}</span>
    </figcaption>
  </figure>
  );
};

export default ServicesVolumeVisual;
import { useI18n } from '@/i18n/i18n';
