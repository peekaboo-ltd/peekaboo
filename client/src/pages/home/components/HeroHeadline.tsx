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
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="space-y-4"
    >
      <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[#edb100]/35 bg-[#fff4be] px-3 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-[#6b4d00]">
        Fast · Reliable · Local
      </p>
      <h1 className="max-w-[600px] text-[32px] font-extrabold leading-[1.02] tracking-[-0.025em] text-[#0a0a0a] sm:text-[42px] lg:text-[52px]">
        {activeTab === 'personal' ? personalTitle1 : businessTitle1}
        <br />
        <span className="text-[#d49e00] text-[32px] sm:text-[42px] lg:text-[52px]">
          {activeTab === 'personal' ? personalTitle2 : businessTitle2}
        </span>{' '}
        in Kigali.
      </h1>
      <p className="max-w-[500px] text-[13px] leading-[1.7] text-[#6b6f76]">
        {activeTab === 'personal' ? personalSubtitle : businessSubtitle}
      </p>
    </motion.hgroup>
  </AnimatePresence>
);

export default HeroHeadline;
