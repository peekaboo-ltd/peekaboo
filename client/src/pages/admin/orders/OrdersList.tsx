import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DataTable } from '../../../components/tables/DataTable';
import { OrderStatusBadge } from '../../../components/orders/OrderStatusBadge';
import { OrderTypeBadge } from '../../../components/orders/OrderTypeBadge';
import { OrderRowActions } from '../../../components/orders/OrderRowActions';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Plus, Download } from 'lucide-react';
import { useOrdersManagement } from '../../../hooks/orders/useOrdersManagement';
import { OrderStatus, OrderType } from '../../../types/order.type';
import type { Column } from '../../../types/table.types';
import type { Order } from '../../../types/order.type';
import { toast } from 'sonner';
import { UUID } from '@/types';

export const OrdersList: React.FC = () => {
  const navigate = useNavigate();

  const {
    orders,
    isLoading,
    pageCount,
    filters,
    setFilters,
    updateOrderStatus,
    deleteOrder,
  } = useOrdersManagement();

  const columns: Column<Order>[] = useMemo(() => [
    {
      id: 'referenceId',
      header: 'Reference ID',
      accessor: 'referenceId',
      sortable: true,
      cell: ({ value }) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'type',
      sortable: true,
      cell: ({ value }) => <OrderTypeBadge type={value} />,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: ({ value }) => <OrderStatusBadge status={value} />,
    },
    {
      id: 'sender',
      header: 'Sender',
      accessor: (row) => row.senderName || row.sender?.name || 'N/A',
      sortable: true,
    },
    {
      id: 'recipient',
      header: 'Recipient',
      accessor: (row) => row.recipientName || row.recipient?.name || 'N/A',
      sortable: true,
    },
    {
      id: 'fee',
      header: 'Fee',
      accessor: (row) => row.finalFee || row.initialFee,
      sortable: true,
      cell: ({ value }) => (
        <span className="font-medium">${value.toFixed(2)}</span>
      ),
    },
    {
      id: 'createdAt',
      header: 'Created Date',
      accessor: 'createdAt',
      sortable: true,
      cell: ({ value }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(value), 'MMM dd, yyyy HH:mm')}
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

  const handleSortChange = (sort: { column: string; direction: 'asc' | 'desc' }) => {
    // Implement sorting logic if backend supports it
    console.log('Sort change:', sort);
  };

  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search, page: 1 });
  };

  const handleStatusFilterChange = (status: string) => {
    setFilters({
      ...filters,
      status: status === 'all' ? undefined : status as OrderStatus,
      page: 1
    });
  };

  const handleTypeFilterChange = (type: string) => {
    setFilters({
      ...filters,
      type: type === 'all' ? undefined : type as typeof OrderType[keyof typeof OrderType],
      page: 1
    });
  };

  const handleRowClick = (order: Order) => {
    navigate(`/admin/orders/${order.id}`);
  };

  const handleUpdateStatus = async (order: Order, status: OrderStatus) => {
    try {
      await updateOrderStatus(order.id as UUID, status);
    } catch (error) {
      // Error is handled in the hook
      console.error(error);
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(order.id as UUID);
      } catch (error) {
        // Error is handled in the hook
        console.error(error);
    }
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await updateOrderStatus(order.id as UUID, OrderStatus.CANCELLED);
      } catch (error) {
        // Error is handled in the hook
        console.error(error);
      }
    }
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon!');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all delivery orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => navigate('/admin/orders/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <Input
                placeholder="Search by ID, sender, recipient..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={filters.status || 'all'} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.values(OrderStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <Select value={filters.type || 'all'} onValueChange={handleTypeFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value={OrderType.SEND}>Send</SelectItem>
                  <SelectItem value={OrderType.RECEIVE}>Receive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            data={orders}
            columns={columns}
            pageCount={pageCount}
            pageIndex={(filters.page || 1) - 1}
            pageSize={filters.limit || 10}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSortChange={handleSortChange}
            isLoading={isLoading}
            onRowClick={handleRowClick}
            emptyMessage="No orders found"
            actions={(order) => (
              <OrderRowActions
                order={order}
                onUpdateStatus={(status) => handleUpdateStatus(order, status)}
                onDelete={() => handleDeleteOrder(order)}
                onCancel={() => handleCancelOrder(order)}
              />
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};