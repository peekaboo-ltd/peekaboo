import { cn } from '@/lib/utils';
import type { SizableIcon } from '@/components/icons/brands';

export type PublicAccentTone = 'sky' | 'sage' | 'clay' | 'rose' | 'plum';

export const PUBLIC_ACCENT_TONES: PublicAccentTone[] = [
  'sky',
  'sage',
  'clay',
  'plum',
  'rose',
];

export const publicAccentAt = (index: number): PublicAccentTone =>
  PUBLIC_ACCENT_TONES[index % PUBLIC_ACCENT_TONES.length]!;

interface PublicIconBadgeProps {
  icon: SizableIcon;
  tone?: PublicAccentTone;
  size?: 'sm' | 'md' | 'xs';
  className?: string;
}

const sizeClasses = {
  xs: 'size-8',
  sm: 'h-9 w-9',
  md: 'size-10',
} as const;

const iconSizeClasses = {
  xs: 'size-3.5',
  sm: 'size-4',
  md: 'size-4',
} as const;

const PublicIconBadge = ({
  icon: Icon,
  size = 'sm',
  className,
}: PublicIconBadgeProps) => (
  <span
    className={cn(
      'flex shrink-0 items-center justify-center',
      sizeClasses[size],
      className,
    )}
  >
    <Icon className={iconSizeClasses[size]} aria-hidden="true" />
  </span>
);

export default PublicIconBadge;
