import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Skeleton } from '../../../components/ui/skeleton';
import { Badge } from '../../../components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Key, 
  Ban,
  Phone,
  Mail,
  Calendar,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import userService from '../../../services/user.service';
import type { User } from '../../../types/user.type';
import { RoleBadges } from '../../../components/users/RoleBadges';
import { UserStatusBadge } from '../../../components/users/UserStatusBadge';
import { AuditLogsSection } from '../../../components/orders/AuditLogsSection';
import { DataTable } from '../../../components/tables/DataTable';
import { OrderStatusBadge } from '../../../components/orders/OrderStatusBadge';
import { OrderTypeBadge } from '../../../components/orders/OrderTypeBadge';
import type { Column } from '../../../types/table.types';
import type { Order } from '../../../types/order.type';
import type { OrderAssignment } from '../../../types/orderAssignment.type';
import { usePermissions } from '../../../hooks/auth/usePermissions';

export const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [assignments, setAssignments] = useState<OrderAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUserById(id!);
      setUser(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch user details');
      navigate('/admin/users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    if (!id) return;
    setIsLoadingOrders(true);
    try {
      const data = await userService.getUserOrders(id);
      setOrders(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch user orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchUserAssignments = async () => {
    if (!id) return;
    setIsLoadingAssignments(true);
    try {
      const data = await userService.getUserAssignments(id);
      setAssignments(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch user assignments');
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user || !window.confirm('Send password reset email to this user?')) return;
    
    try {
      await userService.resetPassword(user.id);
      toast.success('Password reset email sent successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    }
  };

  const orderColumns: Column<Order>[] = [
    {
      id: 'referenceId',
      header: 'Reference ID',
      accessor: 'referenceId',
      cell: ({ value }) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'type',
      cell: ({ value }) => <OrderTypeBadge type={value} />,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      cell: ({ value }) => <OrderStatusBadge status={value} />,
    },
    {
      id: 'fee',
      header: 'Fee',
      accessor: (row) => row.finalFee || row.initialFee,
      cell: ({ value }) => (
        <span className="font-medium">${value.toFixed(2)}</span>
      ),
    },
    {
      id: 'createdAt',
      header: 'Date',
      accessor: 'createdAt',
      cell: ({ value }) => (
        <span className="text-sm">
          {format(new Date(value), 'MMM dd, yyyy')}
        </span>
      ),
    },
  ];

  const assignmentColumns: Column<OrderAssignment>[] = [
    {
      id: 'orderId',
      header: 'Order ID',
      accessor: 'orderId',
      cell: ({ value }) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      cell: ({ value }) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      id: 'assignedAt',
      header: 'Assigned Date',
      accessor: 'createdAt',
      cell: ({ value }) => (
        <span className="text-sm">
          {format(new Date(value), 'MMM dd, yyyy HH:mm')}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return <UserDetailsSkeleton />;
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">User not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/admin/users')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userRoles = user.userRoles?.map(ur => ur.role.name) || [];
  const isRider = userRoles.includes('RIDER' as any);
  const isCustomer = userRoles.includes('CUSTOMER' as any);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/users')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">User Details</h1>
          </div>
          <p className="text-muted-foreground">
            {user.name || 'Unnamed User'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleResetPassword}
          >
            <Key className="mr-2 h-4 w-4" />
            Reset Password
          </Button>
          {permissions.canEdit('users') && (
            <Button
              onClick={() => navigate(`/admin/users/${user.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* User Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <UserStatusBadge status={user.status} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Roles</p>
                <RoleBadges roles={userRoles} />
              </div>
            </div>
            
            {user.name && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Name:</span>
                <span className="text-sm">{user.name}</span>
              </div>
            )}
            
            {user.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user.phoneNumber}</span>
            </div>
            
            {user.nationality && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.nationality}</span>
              </div>
            )}
            
            {user.dateOfBirth && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(user.dateOfBirth), 'MMMM d, yyyy')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
              <p className="text-sm font-mono">{user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">{format(new Date(user.createdAt), 'PPpp')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm">{format(new Date(user.updatedAt), 'PPpp')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs 
        defaultValue={isCustomer ? "orders" : isRider ? "assignments" : "audit"} 
        className="w-full"
        onValueChange={(value) => {
          if (value === 'orders' && orders.length === 0) {
            fetchUserOrders();
          } else if (value === 'assignments' && assignments.length === 0) {
            fetchUserAssignments();
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-3">
          {isCustomer && <TabsTrigger value="orders">Orders</TabsTrigger>}
          {isRider && <TabsTrigger value="assignments">Assignments</TabsTrigger>}
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>
        
        {isCustomer && (
          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Orders</CardTitle>
                <CardDescription>
                  Orders placed by this user
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  data={orders}
                  columns={orderColumns}
                  isLoading={isLoadingOrders}
                  emptyMessage="No orders found for this user"
                  onRowClick={(order) => navigate(`/admin/orders/${order.id}`)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {isRider && (
          <TabsContent value="assignments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Rider Assignments</CardTitle>
                <CardDescription>
                  Orders assigned to this rider
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  data={assignments}
                  columns={assignmentColumns}
                  isLoading={isLoadingAssignments}
                  emptyMessage="No assignments found for this rider"
                  onRowClick={(assignment) => navigate(`/admin/orders/${assignment.orderId}`)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        <TabsContent value="audit" className="mt-6">
          <AuditLogsSection 
            entityType="user" 
            entityId={user.id} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const UserDetailsSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      
      <Skeleton className="h-96" />
    </div>
  );
};