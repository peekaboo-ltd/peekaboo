import { ArrowRight, PackagePlus, Route } from 'lucide-react';
import Button from '@/components/inputs/Button';

interface HeroBusinessCtaProps {
  isActive: boolean;
  accountLabel: string;
  tryQuickDeliveryLabel: string;
  onScrollToForm: () => void;
  onContactClick?: () => void;
  onTrackClick?: () => void;
}

const HeroBusinessCta = ({
  isActive,
  accountLabel,
  tryQuickDeliveryLabel,
  onScrollToForm,
  onContactClick,
  onTrackClick,
}: HeroBusinessCtaProps) => (
  <nav className="flex flex-wrap gap-3 pt-1">
    <Button
      type="button"
      primary
      onClick={onScrollToForm}
      className="rounded-md font-medium"
    >
      <PackagePlus className="h-3.5 w-3.5" aria-hidden="true" />
      {isActive ? tryQuickDeliveryLabel : 'Book delivery'}
    </Button>
    <Button
      type="button"
      onClick={isActive ? onContactClick : onTrackClick}
      className={`rounded-md border-border bg-[var(--peekaboo-surface)] text-foreground`}
    >
      {isActive ? (
        <>
          {accountLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </>
      ) : (
        <>
          <Route className="h-3.5 w-3.5" aria-hidden="true" />
          Track package
        </>
      )}
    </Button>
  </nav>
);

export default HeroBusinessCta;
