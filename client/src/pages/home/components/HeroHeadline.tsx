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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="space-y-4"
    >
      <p className="inline-flex w-fit items-center gap-2 rounded-full bg-[#ffc400]/15 px-3 py-1.5 text-[11px] font-normal tracking-[0.06em] text-[#ffc400]">
        Fast · Reliable · Local
      </p>
      <h1 className="max-w-[580px] text-[32px] font-extrabold leading-[1.02] tracking-[-0.025em] text-white sm:text-[42px] lg:text-[52px]">
        {activeTab === 'personal' ? personalTitle1 : businessTitle1}
        <br />
        <span className="text-[#ffc400] text-[32px] sm:text-[42px] lg:text-[52px]">
          {activeTab === 'personal' ? personalTitle2 : businessTitle2}
        </span>{' '}
        in Kigali.
      </h1>
      <p className="max-w-[480px] text-[13px] leading-[1.65] text-white/70">
        {activeTab === 'personal' ? personalSubtitle : businessSubtitle}
      </p>
    </motion.hgroup>
  </AnimatePresence>
);

export default HeroHeadline;
