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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-wrap gap-3 pt-2 max-lg:items-center max-lg:justify-center"
      >
        <button
          onClick={onContactClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg text-sm font-normal hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faBuilding} />
          {accountLabel}
        </button>
        <button
          onClick={onScrollToForm}
          className="inline-flex items-center gap-2 px-6 py-3 text-slate-700 hover:text-slate-900 text-sm font-normal transition-colors cursor-pointer"
        >
          {tryQuickDeliveryLabel}
          <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
        </button>
      </motion.nav>
    )}
  </AnimatePresence>
);

export default HeroBusinessCta;
