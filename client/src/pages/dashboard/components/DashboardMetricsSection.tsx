import { motion, Variants } from 'framer-motion';
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

  const primaryCards = cards.slice(0, 5);
  const secondaryCards = cards.slice(5);

  return (
    <>
      <motion.section
        aria-label="Dashboard metrics"
        className="mb-6 sm:mb-8"
        variants={containerVariants}
      >
        <section className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
          {primaryCards.map((card, index) => (
            <motion.section key={index} variants={itemVariants}>
              <MetricCard {...card} />
            </motion.section>
          ))}
        </section>
      </motion.section>

      {secondaryCards.length > 0 && (
        <motion.section
          aria-label="Additional metrics"
          className="mb-6 sm:mb-8"
          variants={containerVariants}
        >
          <section className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {secondaryCards.map((card, index) => (
              <motion.section key={index} variants={itemVariants}>
                <MetricCard {...card} />
              </motion.section>
            ))}
          </section>
        </motion.section>
      )}
    </>
  );
};

export default DashboardMetricsSection;
