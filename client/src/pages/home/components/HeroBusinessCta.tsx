import Button from "@/components/inputs/Button";
import { Link } from "react-router-dom";

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
  <nav
    className="flex w-full flex-wrap items-center gap-4 max-sm:flex-col max-sm:items-stretch"
    aria-label="Delivery actions"
  >
    <Button
      onClick={isActive ? onContactClick : onTrackClick}
      type="submit"
      variant="primary"
      size="lg"
      disabled={isLoading}
      className="max-sm:w-full"
    >
      {isLoading ? 'Booking…' : isActive ? tryQuickDeliveryLabel : primaryLabel}
    </Button>
    <span className="h-6 w-px bg-(--line) max-sm:hidden" aria-hidden="true" />
    <Link
      onClick={isActive ? onContactClick : onTrackClick}
      to={isActive ? '/contact' : '/track'}
      className="link-sweep text-sm text-(--ink) max-sm:text-center"
    >
      {isActive ? accountLabel : 'Track an order'}
    </Link>
  </nav>
);

export default HeroBusinessCta;
