import { motion } from 'framer-motion';
import type { LandingStats } from '@/types/landing.type';
import { itemVariants } from '../home.animations';

interface HeroTrustIndicatorsProps {
  landingStats?: LandingStats;
  customersLabel: string;
  trustDailyLabel: string;
  growingCommunityLabel: string;
}

const HeroTrustIndicators = ({
  landingStats,
  customersLabel,
  trustDailyLabel,
  growingCommunityLabel,
}: HeroTrustIndicatorsProps) => (
  <motion.figure className="flex items-center gap-6 pt-4" variants={itemVariants}>
    <figcaption className="flex -space-x-3" aria-label="Customer avatars">
      {['JM', 'AK', 'MP', 'CN'].map((initials) => (
        <span
          key={initials}
          className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-normal text-slate-600"
        >
          {initials}
        </span>
      ))}
    </figcaption>
    <address className="not-italic flex flex-col">
      <span className="text-sm font-medium text-slate-900">
        {typeof landingStats?.activeCustomers === 'number'
          ? `${landingStats.activeCustomers.toLocaleString()}+ ${customersLabel}`
          : growingCommunityLabel}
      </span>
      <span className="text-xs text-slate-500 font-normal">{trustDailyLabel}</span>
    </address>
  </motion.figure>
);

export default HeroTrustIndicators;
