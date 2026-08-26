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
      <p className="inline-flex w-fit items-center gap-2 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        <span
          className="h-1.5 w-1.5 rounded-full bg-[var(--ink)]"
          aria-hidden="true"
        />
        {activeTab === 'personal'
          ? 'Same-day delivery in Kigali'
          : 'Delivery built for Kigali teams'}
      </p>
      <h1 className="max-w-[620px] text-[30px] font-medium leading-[1.08] tracking-[-0.01em] text-foreground sm:text-[40px] lg:text-[48px]">
        {activeTab === 'personal' ? personalTitle1 : businessTitle1}
        <br />
        <span className="text-[var(--ink)] text-[30px] font-medium leading-[1.08] tracking-[-0.01em]">
          {activeTab === 'personal' ? personalTitle2 : businessTitle2}
        </span>{' '}
        in Kigali.
      </h1>
      <p className="max-w-[500px] text-[13px] font-normal leading-[1.7] text-muted-foreground">
        {activeTab === 'personal' ? personalSubtitle : businessSubtitle}
      </p>
    </motion.hgroup>
  </AnimatePresence>
);

export default HeroHeadline;
