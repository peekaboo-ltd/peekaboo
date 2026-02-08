import { motion, Variants } from 'framer-motion';
import OrdersBarChart from '@/components/dashboard/OrdersBarChart';
import RevenueLineChart from '@/components/dashboard/RevenueLineChart';
import type { ChartDataPoint } from '@/types/dashboard.type';
import { RoleTypes } from '@/types/auth.type';

interface DashboardChartsSectionProps {
  showCharts: boolean;
  ordersData: ChartDataPoint[];
  revenueData: ChartDataPoint[];
  deliveriesData?: ChartDataPoint[];
  ordersTitle: string;
  revenueTitle: string;
  role?: RoleTypes;
  containerVariants?: Variants;
  itemVariants?: Variants;
}

const DashboardChartsSection = ({
  showCharts,
  ordersData,
  revenueData,
  deliveriesData = [],
  ordersTitle,
  revenueTitle,
  role,
  containerVariants,
  itemVariants,
}: DashboardChartsSectionProps) => {
  if (!showCharts) return null;

  const isAdminOrStaff = role === RoleTypes.ADMIN || role === RoleTypes.STAFF;
  const isRider = role === RoleTypes.RIDER;
  const showTwoColumns = isAdminOrStaff;

  return (
    <motion.section
      aria-label="Dashboard charts"
      className={`grid grid-cols-1 ${showTwoColumns ? 'lg:grid-cols-2' : ''} gap-3 sm:gap-4`}
      variants={containerVariants}
    >
      {isAdminOrStaff && (
        <>
          <motion.div variants={itemVariants}>
            <OrdersBarChart data={ordersData} title={ordersTitle} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <RevenueLineChart data={revenueData} title={revenueTitle} />
          </motion.div>
        </>
      )}
      {role === RoleTypes.BUSINESS && (
        <motion.div variants={itemVariants}>
          <OrdersBarChart data={ordersData} title={ordersTitle} />
        </motion.div>
      )}
      {isRider && (
        <motion.div variants={itemVariants}>
          <OrdersBarChart data={deliveriesData} title="Deliveries" />
        </motion.div>
      )}
    </motion.section>
  );
};

export default DashboardChartsSection;
