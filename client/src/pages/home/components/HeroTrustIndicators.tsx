import { motion } from 'framer-motion';
import type { LandingStats } from '@/types/landing.type';
import { itemVariants } from '../home.animations';

interface HeroTrustIndicatorsProps {
  landingStats?: LandingStats;
  activeCustomersLabel: string;
  completedOrdersLabel: string;
  fallbackLabel: string;
}

const AVATARS = [
  { initials: 'JM', className: 'bg-[#edb100] text-[#0a0a0a]' },
  { initials: 'AK', className: 'bg-[#0a0a0a] text-white' },
  { initials: 'MP', className: 'bg-[#fff4be] text-[#0a0a0a]' },
  { initials: 'CN', className: 'bg-[#3a3a3a] text-white' },
];

const HeroTrustIndicators = ({
  landingStats,
  activeCustomersLabel,
  completedOrdersLabel,
  fallbackLabel,
}: HeroTrustIndicatorsProps) => {
  const activeCustomers =
    typeof landingStats?.activeCustomers === 'number'
      ? landingStats.activeCustomers
      : undefined;
  const completedOrders =
    typeof landingStats?.customersWithOrders === 'number'
      ? landingStats.customersWithOrders
      : undefined;

  const hasStats = activeCustomers !== undefined || completedOrders !== undefined;

  return (
    <motion.figure
      className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center"
      variants={itemVariants}
    >
      <figcaption className="flex" aria-label="Peekaboo senders">
        {AVATARS.map((avatar, index) => (
          <span
            key={avatar.initials}
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--peekaboo-warm)] text-[11px] font-bold ${
              index === 0 ? '' : '-ml-2.5'
            } ${avatar.className}`}
          >
            {avatar.initials}
          </span>
        ))}
      </figcaption>
      <address className="not-italic text-[13px] leading-relaxed text-[#6b6f76]">
        {hasStats ? (
          <>
            {activeCustomers !== undefined && (
              <span className="block font-semibold text-[#0a0a0a]">
                {activeCustomers.toLocaleString()} {activeCustomersLabel}
              </span>
            )}
            {completedOrders !== undefined && (
              <span>
                {completedOrders.toLocaleString()} {completedOrdersLabel}
              </span>
            )}
          </>
        ) : (
          <span className="block font-semibold text-[#0a0a0a]">{fallbackLabel}</span>
        )}
      </address>
    </motion.figure>
  );
};

export default HeroTrustIndicators;
