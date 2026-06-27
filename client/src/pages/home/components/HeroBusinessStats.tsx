import { AnimatePresence, motion } from 'framer-motion';
import type { HeroBusinessStat } from '../home.types';

interface HeroBusinessStatsProps {
  isActive: boolean;
  stats: HeroBusinessStat[];
}

const HeroBusinessStats = ({ isActive, stats }: HeroBusinessStatsProps) => (
  <AnimatePresence mode="wait">
    {isActive && (
      <motion.ul
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="grid grid-cols-3 gap-4 pt-4"
      >
        {stats.map((stat) => (
          <li
            key={stat.label}
            className="rounded-[10px] border border-[#ececea] bg-white p-3 text-center shadow-[0_1px_2px_rgba(10,10,10,0.04)]"
          >
            <data className="block text-[18px] font-extrabold tracking-[-0.02em] text-[#0a0a0a]">
              {stat.value}
            </data>
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6b6f76]">
              {stat.label}
            </span>
          </li>
        ))}
      </motion.ul>
    )}
  </AnimatePresence>
);

export default HeroBusinessStats;
