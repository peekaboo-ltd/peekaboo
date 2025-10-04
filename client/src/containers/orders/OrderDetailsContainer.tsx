import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import { ArrowLeft, Edit, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import orderService from '../../services/order.service';
import type { Order } from '../../types/order.type';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { OrderTypeBadge } from '../../components/orders/OrderTypeBadge';
import { AssignmentSection } from '../../components/orders/AssignmentSection';
import { OrderMap } from '../../components/orders/OrderMap';
import { ActivityTimeline } from '../../components/orders/ActivityTimeline';
import { AuditLogsSection } from '../../components/orders/AuditLogsSection';
import { UpdateStatusDropdown } from '../../components/orders/UpdateStatusDropdown';

export const OrderDetailsContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getOrderById(id!);
      setOrder(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch order details');
      navigate('/admin/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!order) return;
    
    setIsUpdating(true);
    try {
      const updated = await orderService.updateOrderStatus(order.id, status as any);
      setOrder(updated);
      toast.success('Order status updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await orderService.cancelOrder(order.id);
      setOrder(updated);
      toast.success('Order cancelled successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignmentUpdate = () => {
    fetchOrderDetails();
  };

  if (isLoading) {
    return <OrderDetailsSkeleton />;
  }

  if (!order) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Order not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/admin/orders')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/orders')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Order Details</h1>
          </div>
          <p className="text-muted-foreground">
            Reference: {order.referenceId}
          </p>
        </div>
        <div className="flex gap-2">
          <UpdateStatusDropdown
            currentStatus={order.status}
            onStatusChange={handleStatusUpdate}
            disabled={isUpdating}
          />
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/orders/${order.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelOrder}
            disabled={isUpdating || order.status === 'CANCELLED'}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Order Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <OrderTypeBadge type={order.type} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                <p className="text-sm">{format(new Date(order.createdAt), 'PPpp')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm">{format(new Date(order.updatedAt), 'PPpp')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Initial Fee</p>
                <p className="text-lg font-semibold">${order.initialFee.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Final Fee</p>
                <p className="text-lg font-semibold">
                  ${(order.finalFee || order.initialFee).toFixed(2)}
                </p>
              </div>
              {order.discount && order.discount > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Discount</p>
                  <p className="text-lg font-semibold text-green-600">
                    -${order.discount.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sender and Recipient Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sender Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-sm">{order.senderName || order.sender?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-sm">{order.senderPhoneNumber || order.sender?.phoneNumber || 'N/A'}</p>
            </div>
            {order.locationFrom && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-sm">{order.locationFrom.address || 'Location set'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recipient Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-sm">{order.recipientName || order.recipient?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-sm">{order.recipientPhoneNumber || order.recipient?.phoneNumber || 'N/A'}</p>
            </div>
            {order.locationTo && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-sm">{order.locationTo.address || 'Location set'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      {(order.locationFrom || order.locationTo) && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Route</CardTitle>
            <CardDescription>
              View the pickup and delivery locations on the map
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderMap order={order} />
          </CardContent>
        </Card>
      )}

      {/* Tabs Section */}
      <Tabs defaultValue="assignment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assignment">Assignment</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assignment" className="mt-6">
          <AssignmentSection 
            orderId={order.id} 
            onUpdate={handleAssignmentUpdate}
          />
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <ActivityTimeline orderId={order.id} />
        </TabsContent>
        
        <TabsContent value="audit" className="mt-6">
          <AuditLogsSection 
            entityType="order" 
            entityId={order.id} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const OrderDetailsSkeleton: React.FC = () => {
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
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
      
      <Skeleton className="h-96" />
    </div>
  );
};