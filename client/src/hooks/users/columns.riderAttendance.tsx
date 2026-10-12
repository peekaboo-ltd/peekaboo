import { UserStatus } from '@/constants/user.constants';
import { ellipsisHClassName, tableActionClassName } from '@/constants/inputs.constants';
import CustomPopover from '@/components/inputs/CustomPopover';
import { useI18n } from '@/i18n/i18n';
import { RiderAttendanceItem } from '@/types/user.type';
import { formatDate } from '@/utils/strings.util';
import { faCircleInfo, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

export const useRiderAttendanceColumns = () => {
  const { t } = useI18n();

  const attendanceColumns: ColumnDef<RiderAttendanceItem>[] = useMemo(
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
        header: t('common.status'),
        accessorKey: 'status',
        cell: ({ row }) => {
          const status = row.original.status === UserStatus.INACTIVE
            ? {
                icon: faCircleXmark,
                iconColor: 'text-(--ink)',
                text: t('riderManagement.checkOut'),
              }
            : {
                icon: faCircleCheck,
                iconColor: 'text-(--ink)',
                text: t('riderManagement.checkIn'),
              };
          return (
            <p className={`flex items-center gap-2 text-xs ${status.iconColor}`}>
              <FontAwesomeIcon className="text-xs" icon={status.icon} />
              {status.text}
            </p>
          );
        },
      },
      {
        header: t('common.actions'),
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
                to={`/rider-management/attendance/${row.original.id}`}
              >
                <FontAwesomeIcon icon={faCircleInfo} />
                {t('riderManagement.viewProof')}
              </Link>
            </menu>
          </CustomPopover>
        ),
      },
    ],
    [t],
  );

  return { attendanceColumns };
};
