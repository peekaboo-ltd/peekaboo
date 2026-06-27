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
      onClick={onScrollToForm}
      className="rounded-full bg-[#edb100] border-[#edb100] text-[#0a0a0a] hover:bg-[#d49e00] hover:border-[#d49e00] font-semibold shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
    >
      <PackagePlus className="h-3.5 w-3.5" aria-hidden="true" />
      {isActive ? tryQuickDeliveryLabel : 'Book delivery'}
    </Button>
    <Button
      type="button"
      onClick={isActive ? onContactClick : onTrackClick}
      className="rounded-full border-[#ececea] bg-white text-[#0a0a0a] hover:bg-[#f7f6f1] hover:border-[#d9d8d4]"
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
