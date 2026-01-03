import { StatusBadge } from '@/components/inputs/StatusBadge';
import { User, UserRole } from '@/types/user.type';
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
          return (
            <menu className="flex flex-wrap gap-1">
              {roles.length > 0 ? (
                roles.map((userRole: UserRole) => (
                  <span
                    key={userRole.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {userRole.role?.name}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </menu>
          );
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
