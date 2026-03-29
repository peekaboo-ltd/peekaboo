import { StatusBadge } from '@/components/inputs/StatusBadge';
import { RiderManagementItem } from '@/types/user.type';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

const getPerformanceLabel = (rider: RiderManagementItem) => {
  if (
    rider.rank <= 3 &&
    rider.totalDeliveriesCompleted > 0 &&
    rider.failedDeliveries <= 1 &&
    rider.canceledDeliveries <= 2
  ) {
    return { text: 'Top Performer', className: 'bg-green-100 text-green-700' };
  }

  if (rider.totalDeliveriesCompleted >= 8 && rider.failedDeliveries <= 3) {
    return { text: 'Doing Well', className: 'bg-emerald-100 text-emerald-700' };
  }

  if (rider.totalDeliveriesCompleted === 0 || rider.failedDeliveries >= 4) {
    return { text: 'Needs Support', className: 'bg-red-100 text-red-700' };
  }

  return { text: 'Average', className: 'bg-amber-100 text-amber-700' };
};

export const useRiderManagementColumns = (
  onViewDetails: (rider: RiderManagementItem) => void,
) => {
  const riderManagementColumns: ColumnDef<RiderManagementItem>[] = useMemo(
    () => [
      {
        header: '#',
        accessorKey: 'rank',
        cell: ({ row }) => <span className="font-semibold">#{row.original.rank}</span>,
      },
      {
        header: 'Rider',
        accessorKey: 'riderName',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.riderName || '-'}</span>
            <span className="text-xs text-slate-500">{row.original.riderEmail || '-'}</span>
          </div>
        ),
      },
      {
        header: 'Phone',
        accessorKey: 'riderPhoneNumber',
        cell: ({ row }) => row.original.riderPhoneNumber || '-',
      },
      {
        header: 'Status',
        accessorKey: 'riderStatus',
        cell: ({ row }) => <StatusBadge status={row.original.riderStatus} />,
      },
      {
        header: 'Performance',
        accessorKey: 'performance',
        cell: ({ row }) => {
          const performance = getPerformanceLabel(row.original);
          return (
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${performance.className}`}>
              {performance.text}
            </span>
          );
        },
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => onViewDetails(row.original)}
            className="text-primary underline text-xs"
          >
            View details
          </button>
        ),
      },
    ],
    [onViewDetails],
  );

  return { riderManagementColumns };
};
