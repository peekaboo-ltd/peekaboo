import { motion, type Variants } from 'framer-motion';
import MetricCard from '@/components/dashboard/MetricCard';
import type { MetricCardData } from '@/types/dashboard.type';

interface DashboardMetricsSectionProps {
  cards: MetricCardData[];
  containerVariants?: Variants;
  itemVariants?: Variants;
}

const DashboardMetricsSection = ({
  cards,
  containerVariants,
  itemVariants,
}: DashboardMetricsSectionProps) => {
  if (!cards.length) return null;

  const primaryCards = cards.slice(0, 4);

  return (
    <motion.section
      aria-label="Dashboard metrics"
      className="mb-6 sm:mb-8"
      variants={containerVariants}
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {primaryCards.map((card, index) => (
          <motion.section key={index} variants={itemVariants}>
            <MetricCard {...card} />
          </motion.section>
        ))}
      </section>
    </motion.section>
  );
};

export default DashboardMetricsSection;
