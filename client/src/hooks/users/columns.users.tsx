import { StatusBadge } from '@/components/inputs/StatusBadge';
import { RoleBadges } from '@/components/users/RoleBadges';
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

export const useUsersColumns = () => {
  const usersColumns: ColumnDef<User>[] = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => (
          <span className="font-normal text-[13px]">{row?.original?.name || '-'}</span>
        ),
      },
      {
        header: 'Phone Number',
        accessorKey: 'phoneNumber',
        cell: ({ row }) => row?.original?.phoneNumber || '-',
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }) => row?.original?.email || '-',
      },
      {
        header: 'Roles',
        accessorKey: 'userRoles',
        cell: ({ row }) => {
          const roles = row?.original?.userRoles || [];
          const roleNames = roles
            .map((userRole: UserRole) => userRole?.role?.name)
            .filter(Boolean) as RoleTypes[];
          if (roleNames.length === 0) {
            return <span className="text-gray-400">-</span>;
          }
          return <RoleBadges roles={roleNames} />;
        },
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row?.original?.status} />,
      },
      {
        header: 'Date added',
        accessorKey: 'createdAt',
        cell: ({ row }) => formatDate(row?.original?.createdAt, 'DD/MM/YYYY HH:mm'),
      },
      {
        header: 'Last updated',
        accessorKey: 'updatedAt',
        cell: ({ row }) => formatDate(row?.original?.updatedAt, 'DD/MM/YYYY HH:mm'),
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
            <menu className="w-full flex flex-col gap-1">
              <Link className={tableActionClassName} to={`/users/${row.original.id}`}>
                <FontAwesomeIcon icon={faCircleInfo} />
                View details
              </Link>
            </menu>
          </CustomPopover>
        ),
      },
    ],
    []
  );

  return { usersColumns };
};
