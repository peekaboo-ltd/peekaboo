import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Button from '@/components/inputs/Button';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  setSelectedPayment,
  setUpdateStatusModal,
} from '@/states/slices/payment.slice';
import { useAdminUpdatePaymentStatus } from '@/hooks/payments/payment.hooks';
import { KpayPaymentStatus } from '@/types/payment.types';
import { useState } from 'react';
import { formatCurrency } from '@/utils/strings.util';

const STATUS_OPTIONS = [
  { value: KpayPaymentStatus.PENDING, label: 'Pending' },
  { value: KpayPaymentStatus.SUCCESSFUL, label: 'Successful' },
  { value: KpayPaymentStatus.FAILED, label: 'Failed' },
];

const UpdatePaymentStatusModal = () => {
  const dispatch = useAppDispatch();
  const { selectedPayment, updateStatusModal } = useAppSelector(
    (state) => state.payment,
  );
  const { updatePaymentStatus, isLoading } = useAdminUpdatePaymentStatus();
  const [status, setStatus] = useState<string>(selectedPayment?.status || '');

  const handleClose = () => {
    dispatch(setUpdateStatusModal(false));
    dispatch(setSelectedPayment(undefined));
    setStatus('');
  };

  const handleSubmit = () => {
    if (!selectedPayment?.id || !status) return;
    updatePaymentStatus({ id: selectedPayment.id, status });
  };

  return (
    <Dialog open={updateStatusModal} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Payment Status</DialogTitle>
          <DialogDescription>
            Update the status for payment{' '}
            <span className="font-mono font-semibold">
              {selectedPayment?.internalReferenceId?.slice(0, 8)}...
            </span>{' '}
            ({formatCurrency(selectedPayment?.amount, selectedPayment?.currency)})
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <label className="text-sm font-medium">New Status</label>
          <Select
            value={status}
            onValueChange={setStatus}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            primary
            type="submit"
            onClick={handleSubmit}
            disabled={!status || status === selectedPayment?.status}
            isLoading={isLoading}
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePaymentStatusModal;
