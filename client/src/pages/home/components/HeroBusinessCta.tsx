import { ArrowRight, PackagePlus, Route } from 'lucide-react';
import Button from '@/components/inputs/Button';

interface HeroBusinessCtaProps {
  isActive: boolean;
  accountLabel: string;
  tryQuickDeliveryLabel: string;
  onScrollToForm: () => void;
  onContactClick?: () => void;
}

const HeroBusinessCta = ({
  isActive,
  accountLabel,
  tryQuickDeliveryLabel,
  onScrollToForm,
  onContactClick,
}: HeroBusinessCtaProps) => (
  <nav className="flex flex-wrap gap-3 pt-1">
    <Button
      type="button"
      onClick={onScrollToForm}
      className="rounded-full bg-[#ffc400] border-[#ffc400] text-[#0a0a0a] hover:bg-[#e6ad00] hover:border-[#e6ad00] font-semibold shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
    >
      <PackagePlus className="h-3.5 w-3.5" aria-hidden="true" />
      {isActive ? tryQuickDeliveryLabel : 'Book delivery'}
    </Button>
    <Button
      type="button"
      onClick={isActive ? onContactClick : undefined}
      className="rounded-full border-white/25 text-white hover:bg-white/[0.06] hover:border-white/25"
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
