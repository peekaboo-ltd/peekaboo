import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setOrderPaymentModal, setSelectedOrder } from '@/states/slices/order.slice';
import { PaymentType } from '@/types/payment.types';
import { formatCurrency, formatPhone } from '@/utils/strings.util';
import Button from '../inputs/Button';
import { useCreatePayment } from '@/hooks/payments/payment.hooks';

type PayerType = 'sender' | 'recipient' | 'other';

const OrderPayment = () => {

  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { orderPaymentModal, selectedOrder } = useAppSelector((state) => state.order);
  const [payerType, setPayerType] = useState<PayerType>('sender');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  // CLOSE MODAL
  const closeModal = useCallback(() => {
    dispatch(setOrderPaymentModal(false));
    dispatch(setSelectedOrder(undefined));
    setPayerType('sender');
    setCustomPhone('');
    setPhoneError('');
  }, [dispatch]);

  const { createPayment: createPaymentMutation, isSuccess, isLoading } = useCreatePayment();

  // VALIDATE AND FORMAT PHONE NUMBER
  const validateAndFormatPhone = (phone: string): string | null => {
    // Remove all non-numeric characters
    const cleanedPhone = phone.replace(/\D/g, '');

    // Check if phone is empty
    if (!cleanedPhone) {
      setPhoneError('Phone number is required');
      return null;
    }

    // Handle different formats
    let formattedPhone = cleanedPhone;

    // Remove country code if it starts with 250
    if (formattedPhone.startsWith('250')) {
      formattedPhone = formattedPhone.substring(3);
    }

    // Remove leading zero if present
    if (formattedPhone.startsWith('0')) {
      formattedPhone = formattedPhone.substring(1);
    }

    // Check if the remaining number is 9 digits
    if (formattedPhone.length !== 9) {
      setPhoneError('Phone number must be 9 digits (e.g., 788123456)');
      return null;
    }

    // Format as 250XXXXXXXXX (without plus sign)
    const finalPhone = `250${formattedPhone}`;
    setPhoneError('');
    return finalPhone;
  };

  // GET PAYER INFORMATION
  const getPayerInfo = useCallback((): {
    phone: string | null;
    email: string;
    name: string;
  } => {
    if (payerType === 'sender') {
      return {
        phone: selectedOrder?.sender?.phoneNumber
          ? formatPhone(selectedOrder.sender.phoneNumber, 'RW')
          : selectedOrder?.senderPhoneNumber
            ? formatPhone(selectedOrder.senderPhoneNumber, 'RW')
            : '250788478652',
        email: selectedOrder?.sender?.email || 'info@peekaboo.co.rw',
        name: selectedOrder?.sender?.name || selectedOrder?.senderName || 'Sender',
      };
    } else if (payerType === 'recipient') {
      return {
        phone: selectedOrder?.recipient?.phoneNumber
          ? formatPhone(selectedOrder.recipient.phoneNumber, 'RW')
          : selectedOrder?.recipientPhoneNumber
            ? formatPhone(selectedOrder.recipientPhoneNumber, 'RW')
            : '250788478652',
        email: selectedOrder?.recipient?.email || 'info@peekaboo.co.rw',
        name: selectedOrder?.recipient?.name || selectedOrder?.recipientName || 'Recipient',
      };
    } else {
      // For 'other', validate and format the custom phone
      const formattedPhone = validateAndFormatPhone(customPhone);
      return {
        phone: formattedPhone,
        email: 'info@peekaboo.co.rw',
        name: 'Custom Payer',
      };
    }
  }, [payerType, selectedOrder, customPhone]);

  // CREATE PAYMENT
  const createPayment = useCallback(() => {
    const payerInfo = getPayerInfo();

    // Validate phone for 'other' option
    if (payerType === 'other' && !payerInfo.phone) {
      return;
    }

    createPaymentMutation({
      entityId: selectedOrder?.id,
      amount: selectedOrder?.finalFee || selectedOrder?.initialFee || 0,
      currency: "RWF",
      type: PaymentType.ORDER,
      description: selectedOrder?.notes,
      customerEmail: payerInfo.email,
      customerName: payerInfo.name,
      customerPhone: payerInfo.phone || '250788478652'
    })
  }, [createPaymentMutation, selectedOrder, getPayerInfo, payerType]);

  useEffect(() => {
    if (isSuccess) {
      const orderId = selectedOrder?.id;
      closeModal();
      // Navigate to payment success page
      navigate(`/p/orders/${orderId}/payment-success`);
    }
  }, [isSuccess, closeModal, navigate, selectedOrder?.id]);

  // RESET PHONE ERROR WHEN CHANGING PAYER TYPE
  useEffect(() => {
    setPhoneError('');
    setCustomPhone('');
  }, [payerType]);

  return (
    <Modal isOpen={orderPaymentModal} onClose={closeModal} className='min-w-[50vw]' heading="Order Payment" description="Payment for the order">
      <article className='w-full flex flex-col gap-4'>
        <p className='text-sm'>
          Select who will make the payment for this order:
        </p>

        {/* PAYER SELECTION */}
        <fieldset className='flex flex-col gap-3'>
          <legend className='sr-only'>Select payer</legend>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='radio'
              name='payer'
              value='sender'
              checked={payerType === 'sender'}
              onChange={(e) => setPayerType(e.target.value as PayerType)}
              className='w-4 h-4 cursor-pointer'
            />
            <span className='text-sm'>
              Sender {selectedOrder?.senderName || selectedOrder?.sender?.name
                ? `(${selectedOrder?.senderName || selectedOrder?.sender?.name})`
                : ''}
            </span>
          </label>

          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='radio'
              name='payer'
              value='recipient'
              checked={payerType === 'recipient'}
              onChange={(e) => setPayerType(e.target.value as PayerType)}
              className='w-4 h-4 cursor-pointer'
            />
            <span className='text-sm'>
              Recipient {selectedOrder?.recipientName || selectedOrder?.recipient?.name
                ? `(${selectedOrder?.recipientName || selectedOrder?.recipient?.name})`
                : ''}
            </span>
          </label>

          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='radio'
              name='payer'
              value='other'
              checked={payerType === 'other'}
              onChange={(e) => setPayerType(e.target.value as PayerType)}
              className='w-4 h-4 cursor-pointer'
            />
            <span className='text-sm'>Other</span>
          </label>
        </fieldset>

        {/* CUSTOM PHONE INPUT */}
        {payerType === 'other' && (
          <fieldset className='flex flex-col gap-2'>
            <label htmlFor='customPhone' className='text-sm font-medium'>
              Phone Number
            </label>
            <input
              id='customPhone'
              type='tel'
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              placeholder='788123456 or 250788123456'
              className='px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
            />
            {phoneError && (
              <p className='text-sm text-red-600'>{phoneError}</p>
            )}
            <p className='text-xs text-gray-500'>
              Enter a Rwandan phone number (e.g., 788123456 or 250788123456)
            </p>
          </fieldset>
        )}

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
