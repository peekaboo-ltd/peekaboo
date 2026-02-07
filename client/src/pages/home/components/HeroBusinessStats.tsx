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
            className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200"
          >
            <data className="block text-xl font-bold text-slate-900">{stat.value}</data>
            <span className="text-xs text-slate-500">{stat.label}</span>
          </li>
        ))}
      </motion.ul>
    )}
  </AnimatePresence>
);

export default HeroBusinessStats;
