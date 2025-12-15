import React, { useEffect, useMemo, useState } from 'react';
import StaffLayout from '@/components/staff/StaffLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { useLazyGetOrderQuery } from '@/api/queries/orders.queries';
import { useLazyFetchUsersQuery } from '@/api/queries/users.queries';
import { useUpdateOrderMutation } from '@/api/mutations/orders.mutations';
import { useCreateOrderAssignmentMutation } from '@/api/mutations/orderAssignments.mutations';
import { RoleTypes } from '@/types/auth.type';
import { formatCurrency, formatDate } from '@/utils/strings.util';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const StaffOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [triggerOrder, { data: orderResp, isLoading: orderLoading, error: orderError }] = useLazyGetOrderQuery();
  const [fetchUsers, { data: ridersResp, isLoading: ridersLoading }] = useLazyFetchUsersQuery();
  const [updateOrder, { isLoading: savingPrice }] = useUpdateOrderMutation();
  const [createAssignment, { isLoading: savingAssignment }] = useCreateOrderAssignmentMutation();

  const [priceInput, setPriceInput] = useState('');
  const [selectedRider, setSelectedRider] = useState('');

  useEffect(() => {
    if (id) {
      triggerOrder({ id: id as any });
      fetchUsers({ page: 1, limit: 200, roles: [RoleTypes.RIDER] });
    }
  }, [id, triggerOrder, fetchUsers]);

  const order = orderResp?.data;
  const riders = useMemo(
    () => (ridersResp?.rows || ridersResp?.data?.rows || []).filter((u: any) =>
      u.userRoles?.some((ur: any) => ur.role?.name === RoleTypes.RIDER)
    ),
    [ridersResp]
  );

  useEffect(() => {
    if (order?.finalFee) {
      setPriceInput(String(order.finalFee));
    }
    const rider = order?.assignments?.[0]?.assignedTo;
    if (rider?.id) setSelectedRider(rider.id);
  }, [order?.finalFee, order?.assignments]);

  const getLatestStatus = (activities: any[] = []): string => {
    if (!activities || activities.length === 0) return 'PENDING';
    const sorted = [...activities].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return sorted[sorted.length - 1]?.status || 'PENDING';
  };

  const handleSavePrice = async () => {
    if (!id) return;
    const num = Number(priceInput);
    if (Number.isNaN(num) || num <= 0) {
      toast.error('Enter a valid price');
      return;
    }
    try {
      await updateOrder({ id: id as any, order: { finalFee: num } }).unwrap();
      toast.success('Price updated');
      triggerOrder({ id: id as any });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update price');
    }
  };

  const handleReassign = async () => {
    if (!id) return;
    if (!selectedRider) {
      toast.error('Select a rider');
      return;
    }
    try {
      await createAssignment({ orderId: id as any, assignedToId: selectedRider as any }).unwrap();
      toast.success('Rider reassigned');
      triggerOrder({ id: id as any });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reassign rider');
    }
  };

  if (orderLoading) {
    return (
      <StaffLayout>
        <div className="p-6">
          <p className="text-gray-600">Loading order...</p>
        </div>
      </StaffLayout>
    );
  }

  if (orderError || !order) {
    return (
      <StaffLayout>
        <div className="p-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="bg-white rounded-lg shadow p-6">Order not found.</div>
        </div>
      </StaffLayout>
    );
  }

  const status = getLatestStatus(order.activities);
  const rider = order.assignments?.[0]?.assignedTo;

  return (
    <StaffLayout>
      <div className="p-6 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </button>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-500">Order #{order.referenceId}</p>
              <h1 className="text-2xl font-bold text-gray-900">{order.sender?.name || order.senderName || 'Sender'}</h1>
              <p className="text-sm text-gray-600">Created {formatDate(order.createdAt, 'MMM DD, YYYY HH:mm')}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">{status}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 uppercase">Amount</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(order.finalFee || 0, 'RWF')}</p>
              <div className="mt-3 flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSavePrice}
                  disabled={savingPrice}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingPrice ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 uppercase">Rider</p>
              <p className="text-sm font-medium text-gray-900">{rider?.name || 'Unassigned'}</p>
              {rider?.phoneNumber && <p className="text-xs text-gray-600">{rider.phoneNumber}</p>}
              <div className="mt-3 flex gap-2">
                <select
                  value={selectedRider}
                  onChange={(e) => setSelectedRider(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                  disabled={ridersLoading}
                >
                  <option value="">Select rider</option>
                  {riders.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name || r.email}</option>
                  ))}
                </select>
                <button
                  onClick={handleReassign}
                  disabled={savingAssignment}
                  className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingAssignment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reassign'}
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 uppercase">Recipient</p>
              <p className="text-sm font-medium text-gray-900">{order.recipient?.name || order.recipientName || '-'}</p>
              <p className="text-xs text-gray-600">{order.recipient?.phoneNumber || order.recipientPhone || '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Timeline</h2>
          <div className="space-y-4">
            {[...(order.activities || [])]
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((act: any) => (
                <div key={act.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{act.status}</p>
                    <p className="text-xs text-gray-600">{formatDate(act.createdAt, 'MMM DD, YYYY HH:mm')}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffOrderDetailPage;
