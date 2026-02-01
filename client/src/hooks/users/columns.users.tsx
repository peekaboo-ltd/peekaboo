import { StatusBadge } from '@/components/inputs/StatusBadge';
import { RoleBadges } from '@/components/users/RoleBadges';
import { User, UserRole } from '@/types/user.type';
import { RoleTypes } from '@/types/auth.type';
import { formatDate } from '@/utils/strings.util';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

export const useUsersColumns = () => {
  const usersColumns: ColumnDef<User>[] = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name || '-'}</span>
        ),
      },
      {
        header: 'Phone Number',
        accessorKey: 'phoneNumber',
        cell: ({ row }) => row.original.phoneNumber || '-',
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }) => row.original.email || '-',
      },
      {
        header: 'Roles',
        accessorKey: 'userRoles',
        cell: ({ row }) => {
          const roles = row.original.userRoles || [];
          const roleNames = roles
            .map((userRole: UserRole) => userRole.role?.name)
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
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: 'Date added',
        accessorKey: 'createdAt',
        cell: ({ row }) => formatDate(row.original.createdAt, 'DD/MM/YYYY HH:mm'),
      },
      {
        header: 'Last updated',
        accessorKey: 'updatedAt',
        cell: ({ row }) => formatDate(row.original.updatedAt, 'DD/MM/YYYY HH:mm'),
      },
    ],
    []
  );

  return { usersColumns };
};
