import { useI18n } from "@/i18n/i18n";

interface RoutePreviewMapProps {
  className?: string;
  dark?: boolean;
}

const RoutePreviewMap = ({ className = '', dark = false }: RoutePreviewMapProps) => {
  const { t } = useI18n();
  return (
  <svg
    viewBox="0 0 160 72"
    role="img"
    aria-label={t('home.map.previewLabel')}
    className={className}
    preserveAspectRatio="xMidYMid meet"
  >
    <rect
      width="160"
      height="72"
      rx="8"
      fill="var(--surface)"
    />

    {/* Grid */}
    {[16, 32, 48, 56, 64].map((y) => (
      <line
        key={`h-${y}`}
        x1="8"
        y1={y}
        x2="152"
        y2={y}
        stroke="var(--line)"
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
        stroke="var(--line)"
        strokeWidth="0.5"
      />
    ))}

    {/* Route corridor */}
    <path
      d="M 24 48 C 48 44, 72 28, 108 22 C 124 20, 136 26, 140 34"
      fill="none"
      stroke="var(--surface-hover)"
      strokeWidth="14"
      strokeLinecap="round"
    />

    {/* Active route */}
    <path
      d="M 24 48 C 48 44, 72 28, 108 22 C 124 20, 136 26, 140 34"
      fill="none"
      stroke={dark ? 'var(--paper)' : 'var(--ink)'}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="4 3"
    />

    {/* Pickup */}
    <circle cx="24" cy="48" r="5" fill="var(--surface)" stroke={dark ? 'var(--paper)' : 'var(--ink)'} strokeWidth="2" />
    <text
      x="24"
      y="62"
      textAnchor="middle"
      fontSize="7"
      fontWeight="500"
      fill={dark ? 'var(--paper)' : 'var(--muted)'}
      fontFamily="DM Sans, sans-serif"
    >
      Kacyiru
    </text>

    {/* Drop-off */}
    <circle cx="140" cy="34" r="5" fill="var(--ink)" stroke={dark ? 'var(--ink)' : 'var(--paper)'} strokeWidth="1.5" />
    <text
      x="140"
      y="62"
      textAnchor="middle"
      fontSize="7"
      fontWeight="500"
      fill={dark ? 'var(--paper)' : 'var(--muted)'}
      fontFamily="DM Sans, sans-serif"
    >
      Nyamirambo
    </text>

    {/* Rider dot */}
    <circle cx="88" cy="26" r="3.5" fill={dark ? 'var(--paper)' : 'var(--ink)'} />
  </svg>
  );
};

export default RoutePreviewMap;
