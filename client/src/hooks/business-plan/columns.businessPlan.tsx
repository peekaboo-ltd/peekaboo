import { BusinessPlan } from "@/types/businessPlan.type";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { StatusBadge } from "@/components/inputs/StatusBadge";
import { formatDate } from "@/utils/strings.util";
import CustomPopover from "@/components/inputs/CustomPopover";
import { ellipsisHClassName, tableActionClassName } from "@/constants/inputs.constants";
import { Link } from "react-router-dom";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import Button from "@/components/inputs/Button";
import { BusinessPlanStatus } from "@/types/businessPlan.type";
import { faRotateLeft, faTrashCan } from "@fortawesome/free-solid-svg-icons";

interface UseBusinessPlansColumnsParams {
  onRestorePlan?: (id: string, name: string) => void;
  onPermanentlyDeletePlan?: (id: string, name: string) => void;
  isActionLoading?: boolean;
  actionPlanId?: string;
}

export const useBusinessPlansColumns = ({
  onRestorePlan,
  onPermanentlyDeletePlan,
  isActionLoading = false,
  actionPlanId,
}: UseBusinessPlansColumnsParams = {}) => {
  const businessPlansColumns: ColumnDef<BusinessPlan>[] = useMemo(() => [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <article className="flex items-center gap-2">
          <span className="text-sm font-normal">{row.original.name}</span>
          {row?.original?.badge && (
            <span className="rounded-full bg-(--surface) px-2 py-0.8 font-normal text-(--ink)">
              <span className="text-xs font-normal">{row.original.badge}</span>
            </span>
          )}
        </article>
      ),
    },
    {
      header: 'Pricing',
      id: 'pricing',
      cell: ({ row }) => {
        const plan = row.original;
        if (plan.isCustomPricing)
          return <span className="text-(--muted) text-sm">Custom</span>;
        if (plan.pricingTiers?.tiers?.length) {
          const tiers = plan.pricingTiers.tiers.filter((t) => !t.isCustom);
          if (tiers.length === 0)
            return <span className="text-(--muted) text-sm">Custom</span>;
          const prices = tiers
            .map((t) => t.pricePerUnit ?? t.totalPrice)
            .filter((p): p is number => p != null);
          if (prices.length === 0) return <span className="text-(--muted) text-sm">—</span>;
          return `${plan.currency} ${Math.min(...prices).toLocaleString()} – ${Math.max(...prices).toLocaleString()}`;
        }
        if (plan.pricePerOrder != null) {
          return `${plan.currency} ${Number(plan.pricePerOrder).toLocaleString()} / order`;
        }
        return <span className="text-(--muted) text-sm">—</span>;
      },
    },
    {
      header: 'Period',
      accessorKey: 'billingPeriod',
      cell: ({ row }) => {
        const period = row.original.billingPeriod;
        return period
          ? period.charAt(0) + period.slice(1).toLowerCase()
          : '—';
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
          <FontAwesomeIcon
            icon={faCircleCheck}
            className="text-(--muted) cursor-pointer"
          />
        ) : (
          <span className="text-(--muted) text-sm">—</span>
        ),
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: ({ row }) =>
        formatDate(row.original.createdAt, 'DD/MM/YYYY HH:mm'),
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => {
        const plan = row.original;
        const isArchived = plan.status === BusinessPlanStatus.ARCHIVED;
        const isProcessingThisPlan = isActionLoading && actionPlanId === plan.id;
        const planId = plan.id;

        if (!planId) {
          return <span className="text-(--muted) text-sm">—</span>;
        }

        if (isArchived && onRestorePlan && onPermanentlyDeletePlan) {
          return (
            <menu className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => onRestorePlan(planId, plan.name)}
                disabled={isProcessingThisPlan}
                className="h-8 px-3 text-xs"
              >
                <FontAwesomeIcon icon={faRotateLeft} className="mr-1.5" />
                Restore
              </Button>
              <Button
                type="button"
                danger
                onClick={() => onPermanentlyDeletePlan(planId, plan.name)}
                isLoading={isProcessingThisPlan}
                disabled={isProcessingThisPlan}
                className="h-8 px-3 text-xs"
              >
                <FontAwesomeIcon icon={faTrashCan} className="mr-1.5" />
                Delete Forever
              </Button>
            </menu>
          );
        }

        return (
          <CustomPopover
            trigger={
              <FontAwesomeIcon
                icon={faEllipsisH}
                className={ellipsisHClassName}
              />
            }
          >
            <menu className="flex w-full flex-col gap-1">
              <Link
                className={tableActionClassName}
                to={`/business-plans/${planId}/manage`}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
                Manage
              </Link>
            </menu>
          </CustomPopover>
        );
      },
    },
  ], [onRestorePlan, onPermanentlyDeletePlan, isActionLoading, actionPlanId]);
  return { businessPlansColumns };
};
