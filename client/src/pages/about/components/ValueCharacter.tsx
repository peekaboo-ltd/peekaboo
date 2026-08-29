import { useI18n } from '@/i18n/i18n';

export type ValueCharacterVariant =
  | 'speed'
  | 'trust'
  | 'partnership'
  | 'simplicity';

interface ValueCharacterProps {
  variant: ValueCharacterVariant;
  className?: string;
}

const variantStyles: Record<
  ValueCharacterVariant,
  { accent: string; soft: string; labelKey: string }
> = {
  speed: {
    accent: 'var(--public-sky)',
    soft: 'var(--public-sky-soft)',
    labelKey: 'about.values.speed.label',
  },
  trust: {
    accent: 'var(--public-sage)',
    soft: 'var(--public-sage-soft)',
    labelKey: 'about.values.trust.label',
  },
  partnership: {
    accent: 'var(--public-clay)',
    soft: 'var(--public-clay-soft)',
    labelKey: 'about.values.partnership.label',
  },
  simplicity: {
    accent: 'var(--public-plum)',
    soft: 'var(--public-plum-soft)',
    labelKey: 'about.values.simplicity.label',
  },
};

const SpeedCharacter = ({ accent, soft }: { accent: string; soft: string }) => (
  <svg viewBox="0 0 72 88" aria-hidden="true" className="h-full w-full">
    <ellipse cx="36" cy="78" rx="18" ry="4" fill={soft} />
    <circle cx="36" cy="22" r="10" fill={accent} />
    <path
      d="M28 34 Q36 30 44 34 L42 58 Q36 54 30 58 Z"
      fill={accent}
      opacity="0.92"
    />
    <path d="M24 58 L20 76 M48 58 L52 70" stroke={accent} strokeWidth="3" strokeLinecap="round" />
    <path d="M30 44 L18 50 M42 40 L54 36" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const TrustCharacter = ({ accent, soft }: { accent: string; soft: string }) => (
  <svg viewBox="0 0 72 88" aria-hidden="true" className="h-full w-full">
    <ellipse cx="36" cy="78" rx="18" ry="4" fill={soft} />
    <circle cx="36" cy="24" r="10" fill={accent} />
    <rect x="28" y="36" width="16" height="22" rx="4" fill={accent} opacity="0.9" />
    <path d="M24 58 L24 72 M48 58 L48 72" stroke={accent} strokeWidth="3" strokeLinecap="round" />
    <path
      d="M36 42 L40 48 L48 40"
      fill="none"
      stroke="var(--paper)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PartnershipCharacter = ({
  accent,
  soft,
}: {
  accent: string;
  soft: string;
}) => (
  <svg viewBox="0 0 88 88" aria-hidden="true" className="h-full w-full">
    <ellipse cx="44" cy="78" rx="24" ry="4" fill={soft} />
    <circle cx="30" cy="26" r="8" fill={accent} />
    <circle cx="58" cy="26" r="8" fill={accent} opacity="0.75" />
    <path d="M22 38 Q30 34 38 38 L36 56 Q30 52 24 56 Z" fill={accent} />
    <path
      d="M50 38 Q58 34 66 38 L64 56 Q58 52 52 56 Z"
      fill={accent}
      opacity="0.75"
    />
    <path
      d="M34 46 Q44 52 54 46"
      fill="none"
      stroke={accent}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path d="M26 58 L22 72 M38 58 L34 72 M50 58 L54 72 M62 58 L66 72" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const SimplicityCharacter = ({
  accent,
  soft,
}: {
  accent: string;
  soft: string;
}) => (
  <svg viewBox="0 0 72 88" aria-hidden="true" className="h-full w-full">
    <ellipse cx="36" cy="78" rx="18" ry="4" fill={soft} />
    <circle cx="36" cy="22" r="10" fill={accent} />
    <path d="M28 34 Q36 30 44 34 L42 54 Q36 50 30 54 Z" fill={accent} opacity="0.9" />
    <rect x="46" y="48" width="14" height="12" rx="2" fill={accent} opacity="0.55" />
    <path d="M26 56 L22 72 M46 56 L50 72" stroke={accent} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const ValueCharacter = ({ variant, className = '' }: ValueCharacterProps) => {
  const { t } = useI18n();
  const { accent, soft, labelKey } = variantStyles[variant];

  return (
    <span
      className={`flex size-10 items-center justify-center rounded-(--radius-control) bg-(--paper) p-1 ${className}`}
      style={{ boxShadow: `inset 0 0 0 1px ${accent}` }}
      role="img"
      aria-label={t(labelKey)}
    >
      {variant === 'speed' ? (
        <SpeedCharacter accent={accent} soft={soft} />
      ) : null}
      {variant === 'trust' ? (
        <TrustCharacter accent={accent} soft={soft} />
      ) : null}
      {variant === 'partnership' ? (
        <PartnershipCharacter accent={accent} soft={soft} />
      ) : null}
      {variant === 'simplicity' ? (
        <SimplicityCharacter accent={accent} soft={soft} />
      ) : null}
    </span>
  );
};

export default ValueCharacter;
