import { motion, type Variants } from 'framer-motion';
import MetricCard from '@/components/dashboard/MetricCard';
import type { MetricCardData } from '@/types/dashboard.type';
import type { DispatchStripItem } from './DashboardDispatchStrip';
import DispatchTile from './DispatchTile';

interface DashboardMetricsSectionProps {
  cards: MetricCardData[];
  /** Live operational readings. They used to occupy their own full-width strip
   *  directly above this grid — two rows of numbers doing the same job. */
  dispatch?: DispatchStripItem[];
  containerVariants?: Variants;
  itemVariants?: Variants;
}

const DashboardMetricsSection = ({
  cards,
  dispatch = [],
  containerVariants,
  itemVariants,
}: DashboardMetricsSectionProps) => {
  if (!cards.length && !dispatch.length) return null;

  return (
    <motion.section
      aria-label="Dashboard metrics"
      className="flex flex-col gap-4"
      variants={containerVariants}
    >
      {cards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.slice(0, 4).map((card, index) => (
            <motion.div key={index} variants={itemVariants}>
              <MetricCard {...card} />
            </motion.div>
          ))}
        </div>
      )}

      {dispatch.length > 0 && (
        <motion.ul
          variants={itemVariants}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
        >
          {dispatch.map((item) => (
            <DispatchTile key={item.label} item={item} />
          ))}
        </motion.ul>
      )}
    </motion.section>
  );
};

export default DashboardMetricsSection;
