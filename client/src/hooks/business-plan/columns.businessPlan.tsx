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

export const useBusinessPlansColumns = () => {
  const businessPlansColumns: ColumnDef<BusinessPlan>[] = useMemo(() => [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <article className="flex items-center gap-2">
          <span className="text-[13px] font-normal">{row.original.name}</span>
          {row?.original?.badge && (
            <span className="rounded-full bg-green-100 px-2 py-0.8 font-medium uppercase text-green-800">
              <span className="text-[9px] font-normal">{row.original.badge}</span>
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
          return <span className="text-slate-500 text-[13px]">Custom</span>;
        if (plan.pricingTiers?.tiers?.length) {
          const tiers = plan.pricingTiers.tiers.filter((t) => !t.isCustom);
          if (tiers.length === 0)
            return <span className="text-slate-500 text-[13px]">Custom</span>;
          const prices = tiers
            .map((t) => t.pricePerUnit ?? t.totalPrice)
            .filter((p): p is number => p != null);
          if (prices.length === 0) return <span className="text-slate-500 text-[13px]">—</span>;
          return `${plan.currency} ${Math.min(...prices).toLocaleString()} – ${Math.max(...prices).toLocaleString()}`;
        }
        if (plan.pricePerOrder != null) {
          return `${plan.currency} ${Number(plan.pricePerOrder).toLocaleString()} / order`;
        }
        return <span className="text-slate-500 text-[13px]">—</span>;
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
            className="text-secondary-600 cursor-pointer"
          />
        ) : (
          <span className="text-slate-400 text-[13px]">—</span>
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
      cell: ({ row }) => (
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
              to={`/business-plans/${row.original.id}/manage`}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
              Manage
            </Link>
          </menu>
        </CustomPopover>
      ),
    },
  ], []);
  return { businessPlansColumns };
};
