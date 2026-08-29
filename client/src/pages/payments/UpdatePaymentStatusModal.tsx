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
import { useI18n } from '@/i18n/i18n';

const STATUS_OPTIONS = [
  { value: KpayPaymentStatus.PENDING, labelKey: 'status.pending' },
  { value: KpayPaymentStatus.SUCCESSFUL, labelKey: 'status.successful' },
  { value: KpayPaymentStatus.FAILED, labelKey: 'status.failed' },
];

const UpdatePaymentStatusModal = () => {
  const { t } = useI18n();
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
          <DialogTitle>{t('paymentStatus.updateTitle')}</DialogTitle>
          <DialogDescription>
            {t('paymentStatus.updateDescription', {
              reference: `${selectedPayment?.internalReferenceId?.slice(0, 8) ?? ''}…`,
            })}{' '}
            ({formatCurrency(selectedPayment?.amount, selectedPayment?.currency)})
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <label className="text-sm font-normal">{t('paymentStatus.newStatus')}</label>
          <Select
            value={status}
            onValueChange={setStatus}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('paymentStatus.selectStatus')} />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleClose}>
            {t('common.actions.cancel')}
          </Button>
          <Button
            primary
            type="submit"
            onClick={handleSubmit}
            disabled={!status || status === selectedPayment?.status}
            isLoading={isLoading}
          >
            {t('paymentStatus.update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePaymentStatusModal;
