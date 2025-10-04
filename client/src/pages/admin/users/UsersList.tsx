import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DataTable } from '../../../components/tables/DataTable';
import { RoleBadges } from '../../../components/users/RoleBadges';
import { UserStatusBadge } from '../../../components/users/UserStatusBadge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { 
  Plus, 
  Filter, 
  Download, 
  MoreHorizontal,
  Eye,
  Edit,
  Key,
  Ban,
  Trash
} from 'lucide-react';
import { useUsers } from '../../../hooks/users/useUsers';
import { usePermissions } from '../../../hooks/auth/usePermissions';
import { UserStatus } from '../../../constants/user.constants';
import { RoleTypes } from '../../../types/auth.type';
import type { Column } from '../../../types/table.types';
import type { User } from '../../../types/user.type';
import { toast } from 'sonner';

export const UsersList: React.FC = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [roleFilter, setRoleFilter] = useState<RoleTypes | ''>('');

  const {
    users,
    isLoading,
    pageCount,
    filters,
    setFilters,
    updateUserStatus,
    deleteUser,
    resetPassword,
  } = useUsers();

  const columns: Column<User>[] = useMemo(() => [
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.name || 'Unnamed User'}</p>
          {row.email && (
            <p className="text-sm text-muted-foreground">{row.email}</p>
          )}
        </div>
      ),
    },
    {
      id: 'phoneNumber',
      header: 'Phone Number',
      accessor: 'phoneNumber',
      sortable: true,
    },
    {
      id: 'roles',
      header: 'Roles',
      accessor: (row) => row.userRoles?.map(ur => ur.role.name) || [],
      cell: ({ value }) => <RoleBadges roles={value as RoleTypes[]} />,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: ({ value }) => <UserStatusBadge status={value} />,
    },
    {
      id: 'createdAt',
      header: 'Created Date',
      accessor: 'createdAt',
      sortable: true,
      cell: ({ value }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(value), 'MMM dd, yyyy')}
        </span>
      ),
    },
  ], []);

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page: page + 1 });
  };

  const handlePageSizeChange = (size: number) => {
    setFilters({ ...filters, limit: size, page: 1 });
  };

  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search, page: 1 });
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status as UserStatus | '');
    setFilters({ 
      ...filters, 
      status: status ? status as UserStatus : undefined,
      page: 1 
    });
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role as RoleTypes | '');
    setFilters({ 
      ...filters, 
      roles: role ? [role as RoleTypes] : undefined,
      page: 1 
    });
  };

  const handleRowClick = (user: User) => {
    if (permissions.canView('users')) {
      navigate(`/admin/users/${user.id}`);
    }
  };

  const handleUpdateStatus = async (user: User, status: UserStatus) => {
    try {
      await updateUserStatus(user.id, status);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(user.id);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  const handleResetPassword = async (user: User) => {
    if (window.confirm('Send password reset email to this user?')) {
      try {
        await resetPassword(user.id);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon!');
  };

  const renderRowActions = (user: User) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {permissions.canView('users') && (
          <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}
        {permissions.canEdit('users') && (
          <>
            <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
            {user.status !== UserStatus.ACTIVE && (
              <DropdownMenuItem onClick={() => handleUpdateStatus(user, UserStatus.ACTIVE)}>
                Activate User
              </DropdownMenuItem>
            )}
            {user.status !== UserStatus.INACTIVE && (
              <DropdownMenuItem onClick={() => handleUpdateStatus(user, UserStatus.INACTIVE)}>
                Deactivate User
              </DropdownMenuItem>
            )}
            {user.status !== UserStatus.SUSPENDED && (
              <DropdownMenuItem onClick={() => handleUpdateStatus(user, UserStatus.SUSPENDED)}>
                <Ban className="mr-2 h-4 w-4" />
                Suspend User
              </DropdownMenuItem>
            )}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleResetPassword(user)}>
          <Key className="mr-2 h-4 w-4" />
          Reset Password
        </DropdownMenuItem>
        {permissions.canDelete('users') && (
          <DropdownMenuItem 
            onClick={() => handleDeleteUser(user)}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage system users and their roles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {permissions.canCreate('users') && (
            <Button onClick={() => navigate('/admin/users/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <Input
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchChange(searchTerm);
                  }
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Role</label>
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All roles</SelectItem>
                  {Object.values(RoleTypes).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                  <SelectItem value={UserStatus.SUSPENDED}>Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                className="w-full"
                onClick={() => handleSearchChange(searchTerm)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            data={users}
            columns={columns}
            pageCount={pageCount}
            pageIndex={(filters.page || 1) - 1}
            pageSize={filters.limit || 10}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
            onRowClick={permissions.canView('users') ? handleRowClick : undefined}
            emptyMessage="No users found"
            actions={renderRowActions}
          />
        </CardContent>
      </Card>
    </div>
  );
};