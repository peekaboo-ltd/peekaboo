import { StatusBadge } from '@/components/inputs/StatusBadge';
import { User, UserRole } from '@/types/user.type';
import { RoleTypes } from '@/types/auth.type';
import { formatDate } from '@/utils/strings.util';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import CustomPopover from '@/components/inputs/CustomPopover';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import {
  ellipsisHClassName,
  tableActionClassName,
} from '@/constants/inputs.constants';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/i18n';

export const useUsersColumns = () => {
  const { t } = useI18n();
  const usersColumns: ColumnDef<User>[] = useMemo(
    () => [
      {
        header: t('users.name'),
        accessorKey: 'name',
        cell: ({ row }) => (
          <span className="font-normal text-sm">{row?.original?.name || '-'}</span>
        ),
      },
      {
        header: t('users.phone'),
        accessorKey: 'phoneNumber',
        cell: ({ row }) => row?.original?.phoneNumber || '-',
      },
      {
        header: t('users.email'),
        accessorKey: 'email',
        cell: ({ row }) => row?.original?.email || '-',
      },
      {
        header: t('users.roles'),
        accessorKey: 'userRoles',
        cell: ({ row }) => {
          const roles = row?.original?.userRoles || [];
          const roleNames = roles
            .map((userRole: UserRole) =>
              userRole?.role?.name ? t(`role.${userRole.role.name.toLowerCase()}`) : '',
            )
            .filter(Boolean) as RoleTypes[];
          if (roleNames.length === 0) {
            return <span className="text-(--muted)">-</span>;
          }
          return <p>{roleNames.join(', ')}</p>;
        },
      },
      {
        header: t('common.status'),
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row?.original?.status} />,
      },
      {
        header: t('common.dateAdded'),
        accessorKey: 'createdAt',
        cell: ({ row }) => formatDate(row?.original?.createdAt, 'DD/MM/YYYY HH:mm'),
      },
      {
        header: t('common.lastUpdated'),
        accessorKey: 'updatedAt',
        cell: ({ row }) => formatDate(row?.original?.updatedAt, 'DD/MM/YYYY HH:mm'),
      },
      {
        header: t('common.actions'),
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
            <menu className="w-full flex flex-col gap-1">
              <Link className={tableActionClassName} to={`/users/${row.original.id}`}>
                <FontAwesomeIcon icon={faCircleInfo} />
                {t('common.actions.view')}
              </Link>
            </menu>
          </CustomPopover>
        ),
      },
    ],
    [t]
  );

  return { usersColumns };
};
