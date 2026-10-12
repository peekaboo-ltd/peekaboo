import CustomPopover from '@/components/inputs/CustomPopover';
import { ellipsisHClassName, tableActionClassName } from '@/constants/inputs.constants';
import { useI18n } from '@/i18n/i18n';
import { RiderProblemReportItem } from '@/types/user.type';
import { formatDate } from '@/utils/strings.util';
import { faCircleInfo, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

export const useRiderProblemReportColumns = () => {
  const { t } = useI18n();

  const problemReportColumns: ColumnDef<RiderProblemReportItem>[] = useMemo(
    () => [
      {
        header: t('riderManagement.rider'),
        accessorKey: 'riderName',
        cell: ({ row }) => row.original.riderName || '-',
      },
      {
        header: t('riderManagement.time'),
        accessorKey: 'timestamp',
        cell: ({ row }) => formatDate(row.original.timestamp, 'DD/MM/YYYY HH:mm'),
      },
      {
        header: t('riderManagement.type'),
        accessorKey: 'mediaType',
        cell: ({ row }) =>
          row.original.mediaType === 'video'
            ? t('riderManagement.video')
            : t('riderManagement.photo'),
      },
      {
        header: t('riderManagement.location'),
        accessorKey: 'locationLabel',
        cell: ({ row }) => row.original.locationLabel || '-',
      },
      {
        header: t('riderManagement.descriptionLabel'),
        accessorKey: 'description',
        cell: ({ row }) => row.original.description || '-',
      },
      {
        header: t('common.actions'),
        id: 'problem-actions',
        cell: ({ row }) => (
          <CustomPopover
            trigger={
              <FontAwesomeIcon icon={faEllipsisH} className={ellipsisHClassName} />
            }
          >
            <menu className="w-full flex flex-col gap-1">
              <Link
                className={tableActionClassName}
                to={`/rider-management/problem-reports/${row.original.id}`}
              >
                <FontAwesomeIcon icon={faCircleInfo} />
                {t('riderManagement.viewEvidence')}
              </Link>
            </menu>
          </CustomPopover>
        ),
      },
    ],
    [t],
  );

  return { problemReportColumns };
};
