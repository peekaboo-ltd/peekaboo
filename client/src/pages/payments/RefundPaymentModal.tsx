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
import Input from '@/components/inputs/Input';
import { useAdminRefundPayment } from '@/hooks/payments/payment.hooks';
import { MvendRefundMethod, Payment } from '@/types/payment.types';
import { formatCurrency } from '@/utils/strings.util';
import { useI18n } from '@/i18n/i18n';
import { useState } from 'react';

interface RefundPaymentModalProps {
  payment: Payment;
  open: boolean;
  onClose: () => void;
  onRefunded: () => void;
}

const RefundPaymentModal = ({ payment, open, onClose, onRefunded }: RefundPaymentModalProps) => {
  const { t } = useI18n();
  const paid = Number(payment.amount || 0);
  const [method, setMethod] = useState<MvendRefundMethod>('rollback');
  const [amount, setAmount] = useState<string>(String(paid));
  const { refundPayment, isLoading } = useAdminRefundPayment(() => {
    onClose();
    onRefunded();
  });

  const creditAmount = Number(amount);
  const amountIsValid =
    method === 'rollback' || (Number.isFinite(creditAmount) && creditAmount > 0 && creditAmount <= paid);

  const handleSubmit = () => {
    if (!amountIsValid) return;
    refundPayment({
      id: payment.id,
      method,
      amount: method === 'credit' ? creditAmount : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('paymentRefund.title')}</DialogTitle>
          <DialogDescription>
            {t('paymentRefund.description', {
              amount: formatCurrency(paid, payment.currency),
              phone: payment.customerPhone || '—',
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-normal">{t('paymentRefund.method')}</label>
            <Select value={method} onValueChange={(value) => setMethod(value as MvendRefundMethod)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rollback">{t('paymentRefund.methodRollback')}</SelectItem>
                <SelectItem value="credit">{t('paymentRefund.methodCredit')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-(--muted)">
              {method === 'rollback'
                ? t('paymentRefund.methodRollbackHint')
                : t('paymentRefund.methodCreditHint')}
            </p>
          </div>
          {method === 'credit' && (
            <Input
              label={t('paymentRefund.amount')}
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          )}
          {!amountIsValid && (
            <p className="text-xs text-(--danger)">
              {t('paymentRefund.amountInvalid', { max: formatCurrency(paid, payment.currency) })}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            {t('common.actions.cancel')}
          </Button>
          <Button
            primary
            type="submit"
            onClick={handleSubmit}
            disabled={!amountIsValid}
            isLoading={isLoading}
          >
            {t('paymentRefund.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefundPaymentModal;
