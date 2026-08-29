import Button from "@/components/inputs/Button";
import { Link } from "react-router-dom";
import { HERO_DELIVERY_FORM_ID } from "./HeroForm";

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
  onContactClick,
  onTrackClick,
}: HeroBusinessCtaProps) => (
  <nav
    className={`flex ${isActive ? `flex` : `flex-row-reverse`} w-full flex-wrap justify-between items-center gap-4 max-sm:flex-col max-sm:items-stretch`}
    aria-label="Delivery actions"
  >
    <Button
      onClick={isActive ? onContactClick : undefined}
      type={isActive ? 'button' : 'submit'}
      form={isActive ? undefined : HERO_DELIVERY_FORM_ID}
      variant="primary"
      size="lg"
      disabled={isLoading}
      className="max-sm:w-full"
    >
      {isLoading ? 'Booking…' : isActive ? accountLabel : primaryLabel}
    </Button>
    {!isActive ? (
      <Link
        onClick={onTrackClick}
        to="/track"
        className="link-sweep text-sm text-(--ink) max-sm:text-center"
      >
        Track an order
      </Link>
    ) : null}
  </nav>
);

export default HeroBusinessCta;
