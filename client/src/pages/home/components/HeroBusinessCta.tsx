import { ArrowRight } from 'lucide-react';
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
  <nav className="flex flex-wrap items-center gap-6 pt-2" aria-label="Delivery actions">
    <Button
      form="hero-delivery-form"
      type="submit"
      size="lg"
      disabled={isLoading}
    >
      {isLoading
        ? 'Booking…'
        : isActive
          ? tryQuickDeliveryLabel
          : primaryLabel}
    </Button>
    <Button
      type="button"
      variant="link"
      className="link-arrow"
      onClick={isActive ? onContactClick : onTrackClick}
    >
      {isActive ? accountLabel : 'Track an order'}
      <ArrowRight data-slot="icon" className="size-4" aria-hidden="true" />
    </Button>
  </nav>
);

export default HeroBusinessCta;
