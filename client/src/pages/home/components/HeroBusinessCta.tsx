import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBuilding } from '@fortawesome/free-solid-svg-icons';

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
  <AnimatePresence mode="wait">
    {isActive && (
      <motion.nav
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="flex flex-wrap gap-3 pt-2 max-lg:items-center max-lg:justify-center"
      >
        <button
          onClick={onContactClick}
          className="inline-flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-md text-[13px] font-medium hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faBuilding} className="text-[11px]" />
          {accountLabel}
        </button>
        <button
          onClick={onScrollToForm}
          className="inline-flex items-center gap-2 px-2 py-2 text-gray-500 hover:text-gray-900 text-[13px] font-normal transition-colors cursor-pointer"
        >
          {tryQuickDeliveryLabel}
          <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
        </button>
      </motion.nav>
    )}
  </AnimatePresence>
);

export default HeroBusinessCta;
