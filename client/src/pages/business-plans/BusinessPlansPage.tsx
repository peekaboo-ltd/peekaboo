import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTag,
  faPlus,
  faCircleCheck,
  faLayerGroup,
  faGear,
  faTrash,
  faEllipsisH,
} from '@fortawesome/free-solid-svg-icons';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import Table from '@/components/table/Table';
import Button from '@/components/inputs/Button';
import { StatusBadge } from '@/components/inputs/StatusBadge';
import CustomPopover from '@/components/inputs/CustomPopover';
import { ellipsisHClassName, tableActionClassName } from '@/constants/inputs.constants';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import type { BusinessPlan } from '@/types/businessPlan.type';
import { BusinessPlanStatus } from '@/types/businessPlan.type';
import { formatDate } from '@/utils/strings.util';
import {
  InternalPage,
  InternalPageHeader,
  InternalStatCard,
} from '@/components/layout/InternalPage';
import { useLazyFetchBusinessPlansQuery } from '@/api/queries/businessPlan.queries';
import { useDeleteBusinessPlanMutation } from '@/api/mutations/businessPlan.mutations';

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

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const [fetchBusinessPlans, { data, isFetching }] = useLazyFetchBusinessPlansQuery();
  const [deleteBusinessPlan, { isLoading: isDeleting }] = useDeleteBusinessPlanMutation();

  useEffect(() => {
    fetchBusinessPlans({ page, size });
  }, [page, size, fetchBusinessPlans]);

  const plans: BusinessPlan[] = data?.data?.rows ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const totalCount = data?.data?.totalCount ?? 0;

  const stats = useMemo(() => {
    const total = data?.data?.totalCount ?? 0;
    const active = plans.filter((p) => p.status === BusinessPlanStatus.ACTIVE).length;
    const defaultPlan = plans.find((p) => p.isDefault);
    return { total, active, defaultPlan };
  }, [data, plans]);

  const handleDelete = async (plan: BusinessPlan) => {
    if (!window.confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return;
    try {
      await deleteBusinessPlan(plan.id).unwrap();
      toast.success('Business plan deleted.');
      fetchBusinessPlans({ page, size });
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to delete business plan.';
      toast.error(message);
    }
  };

  const columns: ColumnDef<BusinessPlan>[] = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span>{row.original.name}</span>
            {row.original.badge && (
              <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full uppercase">
                {row.original.badge}
              </span>
            )}
          </div>
        ),
      },
      {
        header: 'Pricing',
        id: 'pricing',
        cell: ({ row }) => {
          const plan = row.original;
          if (plan.isCustomPricing) return <span className="text-slate-500">Custom</span>;
          if (plan.pricingTiers?.tiers?.length) {
            const tiers = plan.pricingTiers.tiers.filter((t) => !t.isCustom);
            if (tiers.length === 0) return <span className="text-slate-500">Custom</span>;
            const prices = tiers
              .map((t) => t.pricePerUnit ?? t.totalPrice)
              .filter((p): p is number => p != null);
            if (prices.length === 0) return '—';
            return `${plan.currency} ${Math.min(...prices).toLocaleString()} – ${Math.max(...prices).toLocaleString()}`;
          }
          if (plan.pricePerOrder != null) {
            return `${plan.currency} ${Number(plan.pricePerOrder).toLocaleString()} / order`;
          }
          return '—';
        },
      },
      {
        header: 'Period',
        accessorKey: 'billingPeriod',
        cell: ({ row }) => {
          const period = row.original.billingPeriod;
          return period ? period.charAt(0) + period.slice(1).toLowerCase() : '—';
        },
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: 'Default',
        accessorKey: 'isDefault',
        cell: ({ row }) =>
          row.original.isDefault ? (
            <FontAwesomeIcon icon={faCircleCheck} className="text-secondary-600" />
          ) : (
            <span className="text-slate-400">—</span>
          ),
      },
      {
        header: 'Created',
        accessorKey: 'createdAt',
        cell: ({ row }) => formatDate(row.original.createdAt, 'DD/MM/YYYY HH:mm'),
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <CustomPopover
            trigger={
              <FontAwesomeIcon icon={faEllipsisH} className={ellipsisHClassName} />
            }
          >
            <menu className="w-full flex flex-col gap-1">
              <Link
                className={tableActionClassName}
                to={`/business-plans/${row.original.id}/manage`}
              >
                <FontAwesomeIcon icon={faGear} />
                Manage
              </Link>
              <button
                className={`${tableActionClassName} text-red-600 hover:bg-red-50`}
                onClick={() => handleDelete(row.original)}
                disabled={isDeleting}
              >
                <FontAwesomeIcon icon={faTrash} />
                Delete
              </button>
            </menu>
          </CustomPopover>
        ),
      },
    ],
    [isDeleting]
  );

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
          columns={columns}
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
