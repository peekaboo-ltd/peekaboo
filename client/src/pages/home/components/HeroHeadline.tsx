import { AnimatePresence, motion } from 'framer-motion';
import type { CustomerTab } from '../home.types';

interface HeroHeadlineProps {
  activeTab: CustomerTab;
  personalTitle1: string;
  personalTitle2: string;
  personalSubtitle: string;
  businessTitle1: string;
  businessTitle2: string;
  businessSubtitle: string;
}

const HeroHeadline = ({
  activeTab,
  personalTitle1,
  personalTitle2,
  personalSubtitle,
  businessTitle1,
  businessTitle2,
  businessSubtitle,
}: HeroHeadlineProps) => (
  <AnimatePresence mode="wait">
    <motion.hgroup
      key={activeTab}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <p className="inline-flex w-fit rounded-full border border-secondary-300 bg-secondary-50 px-4 py-1 text-[11px] uppercase tracking-[0.18em] text-secondary-700 font-medium">
        Fast. Reliable. Local.
      </p>
      <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-bold tracking-[-0.02em] leading-[1.05] text-primary-900">
        {activeTab === 'personal' ? personalTitle1 : businessTitle1}
        <br />
        <span className="text-secondary-600">
          {activeTab === 'personal' ? personalTitle2 : businessTitle2}
        </span>
      </h1>
      <p className="text-[14px] text-primary-600 leading-relaxed max-w-lg">
        {activeTab === 'personal' ? personalSubtitle : businessSubtitle}
      </p>
    </motion.hgroup>
  </AnimatePresence>
);

export default HeroHeadline;
