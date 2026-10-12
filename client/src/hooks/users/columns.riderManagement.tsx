import { StatusBadge } from '@/components/inputs/StatusBadge';
import { useI18n } from '@/i18n/i18n';
import { RiderPerformanceItem } from '@/types/user.type';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

const getPerformanceLabelKey = (rider: RiderPerformanceItem) => {
  if (
    rider.rank <= 3 &&
    rider.totalDeliveriesCompleted > 0 &&
    rider.failedDeliveries <= 1 &&
    rider.canceledDeliveries <= 2
  ) {
    return 'riderManagement.topPerformer';
  }

  if (rider.totalDeliveriesCompleted >= 8 && rider.failedDeliveries <= 3) {
    return 'riderManagement.doingWell';
  }

  if (rider.totalDeliveriesCompleted === 0 || rider.failedDeliveries >= 4) {
    return 'riderManagement.needsSupport';
  }

  return 'riderManagement.average';
};

export const useRiderManagementColumns = (detailSearch = '') => {
  const { t } = useI18n();
  const riderManagementColumns: ColumnDef<RiderPerformanceItem>[] = useMemo(
    () => [
      {
        header: '#',
        accessorKey: 'rank',
        cell: ({ row }) => (
          <span className="font-normal">#{row.original.rank}</span>
        ),
      },
      {
        header: t('riderManagement.rider'),
        accessorKey: 'riderName',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-normal">{row.original.riderName || '-'}</span>
            <span className="type-meta">
              {row.original.riderEmail || '-'}
            </span>
          </div>
        ),
      },
      {
        header: t('riderManagement.phone'),
        accessorKey: 'riderPhoneNumber',
        cell: ({ row }) => row.original.riderPhoneNumber || '-',
      },
      {
        header: t('common.status'),
        accessorKey: 'riderStatus',
        cell: ({ row }) => <StatusBadge status={row.original.riderStatus} />,
      },
      {
        header: t('riderManagement.performance'),
        accessorKey: 'performance',
        cell: ({ row }) => {
          const performanceKey = getPerformanceLabelKey(row.original);
          return (
            <span className="px-2 py-1 rounded-md text-xs font-normal bg-(--surface) text-(--ink)">
              {t(performanceKey)}
            </span>
          );
        },
      },
      {
        header: t('common.actions'),
        id: 'actions',
        cell: ({ row }) => (
          <Link
            to={`/rider-management/riders/${row.original.riderId}${detailSearch}`}
            className="text-(--ink) underline text-xs underline-offset-2"
          >
            {t('riderManagement.viewDetails')}
          </Link>
        ),
      },
    ],
    [detailSearch, t],
  );

  return { riderManagementColumns };
};
