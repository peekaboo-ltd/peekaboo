interface MapPin {
  x: number;
  y: number;
  label: string;
  live?: boolean;
}

interface RwandaCoverageMapProps {
  pins?: MapPin[];
  className?: string;
  variant?: 'light' | 'dark';
}

const DEFAULT_PINS: MapPin[] = [
  { x: 52, y: 58, label: 'Kigali', live: true },
  { x: 38, y: 22, label: 'Musanze', live: true },
  { x: 58, y: 78, label: 'Huye', live: true },
  { x: 18, y: 38, label: 'Rubavu', live: true },
  { x: 78, y: 28, label: 'Nyagatare', live: true },
  { x: 14, y: 72, label: 'Rusizi', live: false },
];

const RwandaCoverageMap = ({
  pins = DEFAULT_PINS,
  className = '',
  variant = 'light',
}: RwandaCoverageMapProps) => {
  const isDark = variant === 'dark';
  const fill = isDark ? '#141414' : '#ececea';
  const stroke = isDark ? 'rgba(255,255,255,0.12)' : '#d9d8d4';
  const gridStroke = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(10,10,10,0.04)';

  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="Peekaboo delivery coverage across Rwanda"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id="coverage-grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke={gridStroke} strokeWidth="0.35" />
        </pattern>
        <filter id="pin-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="100" height="100" fill={isDark ? '#0a0a0a' : 'var(--peekaboo-warm, #f7f6f1)'} />
      <rect width="100" height="100" fill="url(#coverage-grid)" />

      {/* Stylized Rwanda outline */}
      <path
        d="M 28 18 C 34 14, 44 12, 54 14 C 66 16, 76 22, 80 32 C 84 42, 82 54, 78 64 C 74 74, 66 82, 54 86 C 42 88, 32 84, 26 74 C 20 64, 18 52, 20 40 C 22 28, 24 22, 28 18 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.6"
      />

      {/* Province dividers (decorative) */}
      <path
        d="M 38 22 L 48 78 M 58 20 L 52 82 M 68 28 L 60 80"
        fill="none"
        stroke={gridStroke}
        strokeWidth="0.35"
        strokeDasharray="1.5 2"
      />

      {pins.map((pin) => (
        <g key={pin.label} transform={`translate(${pin.x}, ${pin.y})`}>
          {pin.live ? (
            <>
              <circle r="4.5" fill="rgba(255,196,0,0.18)" filter="url(#pin-glow)" />
              <circle r="2.2" fill="#ffc400" />
            </>
          ) : (
            <circle r="2" fill={isDark ? 'rgba(255,255,255,0.35)' : '#9e9d98'} />
          )}
          <text
            x="4"
            y="1"
            fontSize="3.2"
            fontWeight="600"
            fill={isDark ? 'rgba(255,255,255,0.85)' : '#0a0a0a'}
            fontFamily="system-ui, sans-serif"
          >
            {pin.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default RwandaCoverageMap;
export type { MapPin };
