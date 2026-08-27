import { Button } from '@/components/ui/button';

interface HeroBusinessCtaProps {
  isActive: boolean;
  isLoading: boolean;
  accountLabel: string;
  primaryLabel: string;
  tryQuickDeliveryLabel: string;
  onContactClick?: () => void;
  onTrackClick?: () => void;
}

const HeroBusinessCta = ({
  isActive,
  isLoading,
  accountLabel,
  primaryLabel,
  tryQuickDeliveryLabel,
  onContactClick,
  onTrackClick,
}: HeroBusinessCtaProps) => (
  <nav className="flex flex-wrap items-center gap-x-5 gap-y-3" aria-label="Delivery actions">
    <Button form="hero-delivery-form" type="submit" size="lg" disabled={isLoading}>
      {isLoading ? 'Booking…' : isActive ? tryQuickDeliveryLabel : primaryLabel}
    </Button>

    <span className="hidden h-6 w-px bg-(--line) sm:block" aria-hidden="true" />

    <Button
      type="button"
      variant="link"
      onClick={isActive ? onContactClick : onTrackClick}
    >
      {isActive ? accountLabel : 'Track an order'}
    </Button>
  </nav>
);

export default HeroBusinessCta;
