import { useCallback, useEffect } from 'react'
import Modal from '../Modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setOrderPaymentModal, setSelectedOrder } from '@/states/slices/order.slice';
import { PaymentType } from '@/types/payment.types';
import { formatCurrency } from '@/utils/strings.util';
import Button from '../inputs/Button';
import { useCreatePayment } from '@/hooks/payments/payment.hooks';

const OrderPayment = () => {

  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const { orderPaymentModal, selectedOrder } = useAppSelector((state) => state.order);

  // CLOSE MODAL
  const closeModal = useCallback(() => {
    dispatch(setOrderPaymentModal(false));
    dispatch(setSelectedOrder(undefined));
  }, [dispatch]);

  const { createPayment: createPaymentMutation, isSuccess, isLoading } = useCreatePayment();

  // CREATE PAYMENT
  const createPayment = useCallback(() => {
    createPaymentMutation({
      entityId: selectedOrder?.id,
      amount: selectedOrder?.finalFee || selectedOrder?.initialFee || 0,
      currency: "RWF",
      type: PaymentType.ORDER,
      description: selectedOrder?.notes,
      customerEmail: selectedOrder?.sender?.email || 'info@peekaboo.co.rw',
      customerName: selectedOrder?.sender?.name || 'Peekaboo',
      customerPhone: selectedOrder?.sender?.phoneNumber || `250788478652`
    })
  }, [createPaymentMutation, selectedOrder?.finalFee, selectedOrder?.id, selectedOrder?.initialFee, selectedOrder?.notes, selectedOrder?.sender?.email, selectedOrder?.sender?.name, selectedOrder?.sender?.phoneNumber]);

  useEffect(() => {
    if (isSuccess) {
      closeModal();
    }
  }, [isSuccess, closeModal]);

  return (
    <Modal isOpen={orderPaymentModal} onOpenChange={closeModal} className='min-w-[50vw]' title="Order Payment" description="Payment for the order">
      <article className='w-full flex flex-col gap-4'>
        <p className='text-sm'>
          Are you sure you want to complete the payment for this order?
        </p>
        <Button primary onClick={(e) => {
          e.preventDefault();
          createPayment();
        }} isLoading={isLoading}>
          Pay {formatCurrency(selectedOrder?.finalFee ?? selectedOrder?.initialFee ?? 0)}
        </Button>
      </article>
    </Modal>
  )
}

export default OrderPayment;
