import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTag,
  faPlus,
  faCircleCheck,
  faLayerGroup,
  faBoxArchive,
} from '@fortawesome/free-solid-svg-icons';
import Table from '@/components/table/Table';
import Modal from '@/components/Modal';
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
import { useI18n } from '@/i18n/i18n';

const BusinessPlansPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('businessPlans.docTitle'));

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
      toast.success(t('businessPlans.restoreSuccess', { name }));
      fetchBusinessPlans({ page: 0, size: 500 });
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        t('businessPlans.restoreError');
      toast.error(message);
    } finally {
      setActionPlanId(undefined);
    }
  };

  // The most destructive action in the admin surface asked for confirmation
  // through a native browser dialog, which stepped outside the app entirely
  // and named no consequence beyond "cannot be undone".
  const [planPendingDeletion, setPlanPendingDeletion] = useState<
    { id: string; name: string } | undefined
  >(undefined);

  const handlePermanentlyDeletePlan = async (id: string, name: string) => {
    setPlanPendingDeletion({ id, name });
  };

  const confirmPermanentDeletion = async () => {
    if (!planPendingDeletion) return;
    const { id, name } = planPendingDeletion;

    try {
      setActionPlanId(id);
      await permanentlyDeleteBusinessPlan(id).unwrap();
      toast.success(t('businessPlans.deleteSuccess', { name }));
      setPlanPendingDeletion(undefined);
      fetchBusinessPlans({ page: 0, size: 500 });
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        t('businessPlans.deleteError');
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
      <section>
        <InternalPageHeader
          eyebrow={t('businessPlans.eyebrow')}
          title={t('businessPlans.title')}
          description={t('businessPlans.description')}
          actions={
            <Button
              primary
              route="/business-plans/create"
              className="flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              {t('businessPlans.create')}
            </Button>
          }
        />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <InternalStatCard
          label={t('businessPlans.total')}
          value={stats.total.toString()}
          icon={<FontAwesomeIcon icon={faLayerGroup} />}
        />
        <InternalStatCard
          label={t('status.active')}
          value={stats.active.toString()}
          icon={<FontAwesomeIcon icon={faCircleCheck} />}
        />
        <InternalStatCard
          label={t('businessPlans.deactivated')}
          value={stats.deactivated.toString()}
          icon={<FontAwesomeIcon icon={faBoxArchive} />}
        />
        <InternalStatCard
          label={t('businessPlans.default')}
          value={stats.defaultPlan?.name ?? '—'}
          icon={<FontAwesomeIcon icon={faTag} />}
        />
      </section>

      <section>
        <h3 className="type-label mb-3">
          {t('businessPlans.active')}
        </h3>
        <Table
          columns={activePlansColumns}
          data={activePlans}
          showPagination={false}
          isLoading={isFetching}
        />
      </section>

      <section>
        <h3 className="type-label mb-3">{t('businessPlans.deactivated')}</h3>
        <Table
          columns={deactivatedPlansColumns}
          data={deactivatedPlans}
          showPagination={false}
          isLoading={isFetching}
          noDataMessage={t('businessPlans.noneDeactivated')}
        />
      </section>

      <Modal
        isOpen={Boolean(planPendingDeletion)}
        onClose={() => setPlanPendingDeletion(undefined)}
        heading={t('businessPlans.deleteHeading', { name: planPendingDeletion?.name ?? '' })}
        headingClassName="text-(--danger)"
      >
        <article className="flex w-full flex-col gap-5">
          <p className="type-body-sm">
            {t('businessPlans.deleteWarning')}
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              onClick={() => setPlanPendingDeletion(undefined)}
              disabled={isPermanentlyDeleting}
            >
              {t('businessPlans.keep')}
            </Button>
            <Button
              type="button"
              danger
              onClick={confirmPermanentDeletion}
              isLoading={isPermanentlyDeleting}
            >
              {t('businessPlans.deletePermanently')}
            </Button>
          </div>
        </article>
      </Modal>
    </InternalPage>
  );
};

export default BusinessPlansPage;
