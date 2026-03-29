import { useEffect, useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTag,
  faPlus,
  faCircleCheck,
  faLayerGroup,
  faBoxArchive,
} from '@fortawesome/free-solid-svg-icons';
import Table from '@/components/table/Table';
import Button from '@/components/inputs/Button';
import { toast } from 'sonner';
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
import {
  usePermanentlyDeleteBusinessPlanMutation,
  useRestoreBusinessPlanMutation,
} from '@/api/mutations/businessPlan.mutations';

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

  const { fetchBusinessPlans, isFetching } = useFetchBusinessPlans();
  const [restoreBusinessPlan, { isLoading: isRestoring }] = useRestoreBusinessPlanMutation();
  const [permanentlyDeleteBusinessPlan, { isLoading: isPermanentlyDeleting }] = usePermanentlyDeleteBusinessPlanMutation();

  useEffect(() => {
    fetchBusinessPlans({ page: 0, size: 500 });
  }, [fetchBusinessPlans]);

  const plans = useMemo<BusinessPlan[]>(
    () => businessPlansList ?? [],
    [businessPlansList],
  );
  const stats = useMemo(() => {
    const total = plans.length;
    const active = plans.filter((p) => p.status === BusinessPlanStatus.ACTIVE).length;
    const deactivated = plans.filter((p) => p.status === BusinessPlanStatus.ARCHIVED).length;
    const defaultPlan = plans.find((p) => p.isDefault);
    return { total, active, deactivated, defaultPlan };
  }, [plans]);

  const activePlans = useMemo(
    () => plans.filter((plan) => plan.status !== BusinessPlanStatus.ARCHIVED),
    [plans]
  );
  const deactivatedPlans = useMemo(
    () => plans.filter((plan) => plan.status === BusinessPlanStatus.ARCHIVED),
    [plans]
  );

  const [actionPlanId, setActionPlanId] = useState<string | undefined>(undefined);

  const handleRestorePlan = async (id: string, name: string) => {
    try {
      setActionPlanId(id);
      await restoreBusinessPlan(id).unwrap();
      toast.success(`Plan "${name}" restored successfully.`);
      fetchBusinessPlans({ page: 0, size: 500 });
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to restore business plan.';
      toast.error(message);
    } finally {
      setActionPlanId(undefined);
    }
  };

  const handlePermanentlyDeletePlan = async (id: string, name: string) => {
    if (!window.confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;

    try {
      setActionPlanId(id);
      await permanentlyDeleteBusinessPlan(id).unwrap();
      toast.success(`Plan "${name}" permanently deleted.`);
      fetchBusinessPlans({ page: 0, size: 500 });
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to permanently delete business plan.';
      toast.error(message);
    } finally {
      setActionPlanId(undefined);
    }
  };

  const { businessPlansColumns: activePlansColumns } = useBusinessPlansColumns();
  const { businessPlansColumns: deactivatedPlansColumns } = useBusinessPlansColumns({
    onRestorePlan: handleRestorePlan,
    onPermanentlyDeletePlan: handlePermanentlyDeletePlan,
    isActionLoading: isRestoring || isPermanentlyDeleting,
    actionPlanId,
  });

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
        <h3 className="mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Active Plans
        </h3>
        <Table
          columns={activePlansColumns}
          data={activePlans}
          showPagination={false}
          isLoading={isFetching}
        />
      </motion.section>

      <motion.section variants={itemVariants}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Deactivated Plans
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            <FontAwesomeIcon icon={faBoxArchive} />
            {stats.deactivated}
          </span>
        </div>
        <Table
          columns={deactivatedPlansColumns}
          data={deactivatedPlans}
          showPagination={false}
          isLoading={isFetching}
          noDataMessage="No deactivated plans."
        />
      </motion.section>
    </InternalPage>
  );
};

export default BusinessPlansPage;
