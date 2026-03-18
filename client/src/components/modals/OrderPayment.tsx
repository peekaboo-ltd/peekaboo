import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setOrderPaymentModal, setSelectedOrder } from '@/states/slices/order.slice';
import { PaymentType } from '@/types/payment.types';
import { formatCurrency, formatPhone } from '@/utils/strings.util';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';
import Button from '../inputs/Button';
import { useCreatePayment, useCreatePublicPayment } from '@/hooks/payments/payment.hooks';

type PayerType = 'sender' | 'recipient' | 'other';

const OrderPayment = () => {

  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { orderPaymentModal, selectedOrder } = useAppSelector((state) => state.order);
  const { token } = useAppSelector((state) => state.auth);
  const isPublic = !token;
  const [payerType, setPayerType] = useState<PayerType>('sender');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [fallbackPhone, setFallbackPhone] = useState<string>('');
  const [fallbackPhoneError, setFallbackPhoneError] = useState<string>('');

  // CLOSE MODAL
  const closeModal = useCallback(() => {
    dispatch(setOrderPaymentModal(false));
    dispatch(setSelectedOrder(undefined));
    setPayerType('sender');
    setCustomPhone('');
    setPhoneError('');
    setFallbackPhone('');
    setFallbackPhoneError('');
  }, [dispatch]);

  const { createPayment: createAuthPaymentMutation, isSuccess: authPaymentSuccess, isLoading: authPaymentLoading } = useCreatePayment();
  const { createPublicPayment: createPublicPaymentMutation, isSuccess: publicPaymentSuccess, isLoading: publicPaymentLoading } = useCreatePublicPayment();

  const isSuccess = isPublic ? publicPaymentSuccess : authPaymentSuccess;
  const isLoading = isPublic ? publicPaymentLoading : authPaymentLoading;
  const createPaymentMutation = isPublic ? createPublicPaymentMutation : createAuthPaymentMutation;

  // Validate phone using shared util; returns 250XXXXXXXXX for API or null
  const validatePhone = (
    phone: string,
    options?: { setError: (s: string) => void; optional?: boolean },
  ): string | null => {
    const setError = options?.setError ?? setPhoneError;
    const optional = options?.optional ?? false;

    if (!phone?.trim()) {
      setError(optional ? '' : 'Phone number is required');
      return null;
    }

    const result = validateAndFormatPhoneNumber(phone);
    setError(result.error ?? '');

    if (!result.isValid || !result.formattedNumber) return null;
    // Convert 0XXXXXXXXX to 250XXXXXXXXX for API
    return '250' + result.formattedNumber.slice(1);
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
            : '250794892784',
        email: selectedOrder?.sender?.email || 'info@peekaboo.co.rw',
        name: selectedOrder?.sender?.name || selectedOrder?.senderName || 'Sender',
      };
    } else if (payerType === 'recipient') {
      return {
        phone: selectedOrder?.recipient?.phoneNumber
          ? formatPhone(selectedOrder.recipient.phoneNumber, 'RW')
          : selectedOrder?.recipientPhoneNumber
            ? formatPhone(selectedOrder.recipientPhoneNumber, 'RW')
            : '250794892784',
        email: selectedOrder?.recipient?.email || 'info@peekaboo.co.rw',
        name: selectedOrder?.recipient?.name || selectedOrder?.recipientName || 'Recipient',
      };
    } else {
      // For 'other', validate and format the custom phone
      const formattedPhone = validatePhone(customPhone);
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

    const fallbackContactPhone = validatePhone(fallbackPhone, {
      setError: setFallbackPhoneError,
      optional: true,
    });
    if (fallbackPhone.trim() && !fallbackContactPhone) return;

    createPaymentMutation({
      entityId: selectedOrder?.id,
      ...(isPublic && { orderId: selectedOrder?.id }),
      amount: selectedOrder?.finalFee || selectedOrder?.initialFee || 0,
      currency: "RWF",
      type: PaymentType.ORDER,
      description: selectedOrder?.notes,
      customerEmail: payerInfo.email,
      customerName: payerInfo.name,
      customerPhone: payerInfo.phone || '250794892784',
      ...(fallbackContactPhone && { metadata: { fallbackContactPhone } }),
    })
  }, [createPaymentMutation, selectedOrder, getPayerInfo, payerType, fallbackPhone]);

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
  useEffect(() => {
    setFallbackPhoneError('');
  }, [fallbackPhone]);

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
              <p className='text-sm text-black'>{phoneError}</p>
            )}
            <p className='text-xs text-gray-500'>
              Enter a Rwandan phone number (e.g., 788123456 or 250788123456)
            </p>
          </fieldset>
        )}

        {/* FALLBACK CONTACT — who to call if sender and recipient aren't answering */}
        <fieldset className='flex flex-col gap-2'>
          <label htmlFor='fallbackPhone' className='text-sm font-medium'>
            Number to call if sender and recipient aren't answering <span className='text-gray-500 font-normal'>(optional)</span>
          </label>
          <input
            id='fallbackPhone'
            type='tel'
            value={fallbackPhone}
            onChange={(e) => setFallbackPhone(e.target.value)}
            placeholder='788123456 or 250788123456'
            className='px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
          />
          {fallbackPhoneError && (
            <p className='text-sm text-black'>{fallbackPhoneError}</p>
          )}
        </fieldset>

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
