import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setOrderPaymentModal, setSelectedOrder } from '@/states/slices/order.slice';
import { PaymentType } from '@/types/payment.types';
import { formatCurrency, formatPhone } from '@/utils/strings.util';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';
import Button from '../inputs/Button';
import TelInput from '../inputs/TelInput';
import { useCreatePayment, useCreatePublicPayment } from '@/hooks/payments/payment.hooks';
import { toast } from 'sonner';
import {
  DEVELOPMENT_PAYMENT_AMOUNT_RWF,
  ENVIRONMENTS,
} from '@/constants/environments.constants';

type PayerType = 'sender' | 'recipient' | 'other';
type UrubutoChannelName = 'MOMO' | 'AIRTEL_MONEY' | 'CARD';

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
  const [channelName, setChannelName] = useState<UrubutoChannelName>('MOMO');

  // CLOSE MODAL
  const closeModal = useCallback(() => {
    dispatch(setOrderPaymentModal(false));
    dispatch(setSelectedOrder(undefined));
    setPayerType('sender');
    setCustomPhone('');
    setPhoneError('');
    setFallbackPhone('');
    setFallbackPhoneError('');
    setChannelName('MOMO');
  }, [dispatch]);

  const { createPayment: createAuthPaymentMutation, isLoading: authPaymentLoading } = useCreatePayment();
  const { createPublicPayment: createPublicPaymentMutation, isLoading: publicPaymentLoading } = useCreatePublicPayment();

  const isLoading = isPublic ? publicPaymentLoading : authPaymentLoading;
  const createPaymentMutation = isPublic ? createPublicPaymentMutation : createAuthPaymentMutation;

  // Validate phone using shared util; returns canonical E.164 for the API.
  const validatePhone = useCallback((
    phone: string,
    options?: {
      setError: (s: string) => void;
      optional?: boolean;
      mobileOnly?: boolean;
    },
  ): string | null => {
    const setError = options?.setError ?? setPhoneError;
    const optional = options?.optional ?? false;

    if (!phone?.trim()) {
      setError(optional ? '' : 'Phone number is required');
      return null;
    }

    const result = validateAndFormatPhoneNumber(phone);
    setError(result.error ?? '');

    if (!result.isValid || !result.e164) return null;
    if (options?.mobileOnly && result.type !== 'MOBILE') {
      setError('Enter a Rwandan mobile number for mobile money');
      return null;
    }

    return result.e164;
  }, []);

  // GET PAYER INFORMATION
  const getPayerInfo = useCallback((): {
    phone?: string;
    email: string;
    name: string;
  } => {
    if (payerType === 'sender') {
      return {
        phone: selectedOrder?.sender?.phoneNumber
          ? formatPhone(selectedOrder.sender.phoneNumber, 'RW')
          : selectedOrder?.senderPhoneNumber
            ? formatPhone(selectedOrder.senderPhoneNumber, 'RW')
            : undefined,
        email: selectedOrder?.sender?.email || 'info@peekaboo.co.rw',
        name: selectedOrder?.sender?.name || selectedOrder?.senderName || 'Sender',
      };
    } else if (payerType === 'recipient') {
      return {
        phone: selectedOrder?.recipient?.phoneNumber
          ? formatPhone(selectedOrder.recipient.phoneNumber, 'RW')
          : selectedOrder?.recipientPhoneNumber
            ? formatPhone(selectedOrder.recipientPhoneNumber, 'RW')
            : undefined,
        email: selectedOrder?.recipient?.email || 'info@peekaboo.co.rw',
        name: selectedOrder?.recipient?.name || selectedOrder?.recipientName || 'Recipient',
      };
    } else {
      return {
        phone: customPhone,
        email: 'info@peekaboo.co.rw',
        name: 'Custom Payer',
      };
    }
  }, [payerType, selectedOrder, customPhone]);

  // CREATE PAYMENT
  const createPayment = useCallback(async () => {
    const payerInfo = getPayerInfo();
    const payerPhone = validatePhone(payerInfo.phone || '', {
      setError: setPhoneError,
      mobileOnly: channelName !== 'CARD',
    });

    if (!payerPhone) {
      return;
    }

    const fallbackContactPhone = validatePhone(fallbackPhone, {
      setError: setFallbackPhoneError,
      optional: true,
    });
    if (fallbackPhone.trim() && !fallbackContactPhone) return;

    const payload = {
      entityId: selectedOrder?.id,
      ...(isPublic && { orderId: selectedOrder?.id }),
      amount: selectedOrder?.finalFee || selectedOrder?.initialFee || 0,
      currency: "RWF",
      type: PaymentType.ORDER,
      description: selectedOrder?.notes,
      customerEmail: payerInfo.email,
      customerName: payerInfo.name,
      customerPhone: payerPhone,
      channelName,
      method: channelName,
      metadata: {
        channelName,
        ...(fallbackContactPhone ? { fallbackContactPhone } : {}),
      },
    };

    try {
      const response = await (createPaymentMutation(payload)).unwrap();
      const paymentUrl =
        response?.paymentUrl ||
        response?.data?.paymentUrl ||
        response?.data?.metadata?.cardProcessingUrl;
      const initiationError = response?.data?.metadata?.initiationError;
      const orderId = selectedOrder?.id;

      if (initiationError) {
        toast.error(
          initiationError?.message ||
            'Payment could not be initiated. Please try again.',
        );
        return;
      }

      if (channelName === 'CARD' && paymentUrl) {
        closeModal();
        window.location.href = paymentUrl;
        return;
      }

      if (orderId) {
        closeModal();
        navigate(`/p/orders/${orderId}/payment-success`);
      }
    } catch (error) {
      console.error('Payment creation failed:', error);
      toast.error('Payment could not be initiated. Please try again.');
    }
  }, [createPaymentMutation, selectedOrder, getPayerInfo, validatePhone, fallbackPhone, channelName, isPublic, closeModal, navigate]);

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
        {phoneError && payerType !== 'other' && (
          <p className='text-sm text-black'>{phoneError}</p>
        )}

        <fieldset className='flex flex-col gap-3'>
          <legend className='text-sm font-medium'>Payment method</legend>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='radio'
              name='channelName'
              value='MOMO'
              checked={channelName === 'MOMO'}
              onChange={(e) => setChannelName(e.target.value as UrubutoChannelName)}
              className='w-4 h-4 cursor-pointer'
            />
            <span className='text-sm'>MTN Mobile Money</span>
          </label>

          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='radio'
              name='channelName'
              value='AIRTEL_MONEY'
              checked={channelName === 'AIRTEL_MONEY'}
              onChange={(e) => setChannelName(e.target.value as UrubutoChannelName)}
              className='w-4 h-4 cursor-pointer'
            />
            <span className='text-sm'>Airtel Money</span>
          </label>

          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='radio'
              name='channelName'
              value='CARD'
              checked={channelName === 'CARD'}
              onChange={(e) => setChannelName(e.target.value as UrubutoChannelName)}
              className='w-4 h-4 cursor-pointer'
            />
            <span className='text-sm'>Card</span>
          </label>
        </fieldset>

        {/* CUSTOM PHONE INPUT */}
        {payerType === 'other' && (
          <fieldset>
            <TelInput
              id='customPhone'
              value={customPhone}
              onChange={setCustomPhone}
              label="Phone Number"
              required
              placeholder='0788 123 456'
              errorMessage={phoneError}
            />
          </fieldset>
        )}

        {/* FALLBACK CONTACT — who to call if sender and recipient aren't answering */}
        <fieldset>
          <TelInput
            id='fallbackPhone'
            value={fallbackPhone}
            onChange={setFallbackPhone}
            label="Fallback contact number (optional)"
            placeholder='0788 123 456'
            errorMessage={fallbackPhoneError}
          />
        </fieldset>

        {ENVIRONMENTS.isPaymentSimulation ? (
          <p className="text-xs font-normal leading-snug text-amber-700">
            Payments are simulated in this environment. No real charge will be
            made.
          </p>
        ) : null}
        {ENVIRONMENTS.isDevPrice ? (
          <p className="text-xs font-normal leading-snug text-amber-700">
            Catalog fee is{' '}
            {formatCurrency(
              selectedOrder?.finalFee ?? selectedOrder?.initialFee ?? 0,
            )}
            . In this environment you will only be charged{' '}
            {formatCurrency(DEVELOPMENT_PAYMENT_AMOUNT_RWF)}.
          </p>
        ) : null}

        <Button primary onClick={(e) => {
          e.preventDefault();
          void createPayment();
        }} isLoading={isLoading}>
          Pay {formatCurrency(selectedOrder?.finalFee ?? selectedOrder?.initialFee ?? 0)}
        </Button>
      </article>
    </Modal>
  )
}

export default OrderPayment;
