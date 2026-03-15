import { useEffect, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTag,
  faPlus,
  faCircleCheck,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';
import Table from '@/components/table/Table';
import Button from '@/components/inputs/Button';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import type { BusinessPlan } from '@/types/businessPlan.type';
import { BusinessPlanStatus } from '@/types/businessPlan.type';
import {
  InternalPage,
  InternalPageHeader,
  InternalStatCard,
} from '@/components/layout/InternalPage';
import { useBusinessPlansColumns } from '@/hooks/business-plan/columns.businessPlan';
import { useFetchBusinessPlans } from '@/hooks/business-plan/businessPlan.hooks';
import { useAppSelector } from '@/states/hooks';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const BusinessPlansPage = () => {
  useDocumentTitle('Business Plans');

  // STATE VARIABLES
  const { businessPlansList } = useAppSelector((state) => state.businessPlan);

  const { fetchBusinessPlans, isFetching, page, setPage, size, setSize, totalPages, totalCount } = useFetchBusinessPlans();

  useEffect(() => {
    fetchBusinessPlans({ page, size });
  }, [page, size, fetchBusinessPlans]);

  const plans = useMemo<BusinessPlan[]>(
    () => businessPlansList ?? [],
    [businessPlansList],
  );
  const stats = useMemo(() => {
    const total = totalCount ?? 0;
    const active = plans.filter((p) => p.status === BusinessPlanStatus.ACTIVE).length;
    const defaultPlan = plans.find((p) => p.isDefault);
    return { total, active, defaultPlan };
  }, [totalCount, plans]);

  const { businessPlansColumns } = useBusinessPlansColumns();

  return (
    <InternalPage>
      <motion.section variants={itemVariants}>
        <InternalPageHeader
          eyebrow="Admin"
          title="Business Plans"
          description="Create and manage pricing plans assigned to organizations."
          actions={
            <Button
              primary
              route="/business-plans/create"
              className="flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              Create Plan
            </Button>
          }
        />
      </motion.section>

      <motion.section
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        variants={itemVariants}
      >
        <InternalStatCard
          label="Total Plans"
          value={stats.total.toString()}
          icon={<FontAwesomeIcon icon={faLayerGroup} />}
        />
        <InternalStatCard
          label="Active"
          value={stats.active.toString()}
          icon={<FontAwesomeIcon icon={faCircleCheck} />}
        />
        <InternalStatCard
          label="Default Plan"
          value={stats.defaultPlan?.name ?? '—'}
          icon={<FontAwesomeIcon icon={faTag} />}
        />
      </motion.section>

      <motion.section variants={itemVariants}>
        <Table
          columns={businessPlansColumns}
          data={plans}
          showPagination
          page={page}
          setPage={setPage}
          size={size}
          setSize={setSize}
          totalPages={totalPages}
          totalCount={totalCount}
          isLoading={isFetching}
        />
      </motion.section>
    </InternalPage>
  );
};

export default BusinessPlansPage;
