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
  <motion.figure className="flex items-center gap-5 pt-4" variants={itemVariants}>
    <figcaption className="flex -space-x-2.5" aria-label="Customer avatars">
      {['JM', 'AK', 'MP', 'CN'].map((initials) => (
        <span
          key={initials}
          className="w-9 h-9 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[11px] font-normal text-gray-500"
        >
          {initials}
        </span>
      ))}
    </figcaption>
    <address className="not-italic flex flex-col gap-0.5">
      <span className="text-[13px] font-medium text-gray-900">
        {typeof landingStats?.activeCustomers === 'number'
          ? `${landingStats.activeCustomers.toLocaleString()}+ ${customersLabel}`
          : growingCommunityLabel}
      </span>
      <span className="text-[11px] text-gray-400 font-normal">{trustDailyLabel}</span>
    </address>
  </motion.figure>
);

export default HeroTrustIndicators;
