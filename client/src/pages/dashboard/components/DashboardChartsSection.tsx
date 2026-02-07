import { motion, Variants } from 'framer-motion';
import OrdersBarChart from '@/components/dashboard/OrdersBarChart';
import RevenueLineChart from '@/components/dashboard/RevenueLineChart';
import type { ChartDataPoint } from '@/types/dashboard.type';

interface DashboardChartsSectionProps {
  showCharts: boolean;
  ordersData: ChartDataPoint[];
  revenueData: ChartDataPoint[];
  ordersTitle: string;
  revenueTitle: string;
  containerVariants?: Variants;
  itemVariants?: Variants;
}

const DashboardChartsSection = ({
  showCharts,
  ordersData,
  revenueData,
  ordersTitle,
  revenueTitle,
  containerVariants,
  itemVariants,
}: DashboardChartsSectionProps) => {
  if (!showCharts) return null;

  return (
    <motion.section
      aria-label="Dashboard charts"
      className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <OrdersBarChart data={ordersData} title={ordersTitle} />
      </motion.div>
      <motion.div variants={itemVariants}>
        <RevenueLineChart data={revenueData} title={revenueTitle} />
      </motion.div>
    </motion.section>
  );
};

export default DashboardChartsSection;
