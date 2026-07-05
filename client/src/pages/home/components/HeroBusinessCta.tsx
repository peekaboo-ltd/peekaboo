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
      className="rounded-full font-semibold"
    >
      <PackagePlus className="h-3.5 w-3.5" aria-hidden="true" />
      {isActive ? tryQuickDeliveryLabel : 'Book delivery'}
    </Button>
    <Button
      type="button"
      onClick={isActive ? onContactClick : onTrackClick}
      className="rounded-full border-[#ececea] bg-white text-[#0a0a0a] hover:!bg-white hover:!border-[#d9d8d4] hover:!shadow-[0_2px_8px_-2px_rgba(10,10,10,0.15)] hover:!text-[#0a0a0a] transition-all duration-300"
    >
      {isActive ? (
        <>
          {accountLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </>
      ) : (
        <>
          <Route className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
          Track package
        </>
      )}
    </Button>
  </nav>
);

export default HeroBusinessCta;
