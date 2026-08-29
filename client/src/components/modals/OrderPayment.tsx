import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import Modal from '../Modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setOrderPaymentModal, setSelectedOrder } from '@/states/slices/order.slice';
import {
  PaymentChannel,
  PaymentType,
  isMobileMoneyChannel,
} from '@/types/payment.types';
import { formatCurrency, formatPhone } from '@/utils/strings.util';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';
import Button from '../inputs/Button';
import {
  useCreatePayment,
  useCreatePublicPayment,
} from '@/hooks/payments/payment.hooks';
import {
  DEVELOPMENT_PAYMENT_AMOUNT_RWF,
  ENVIRONMENTS,
} from '@/constants/environments.constants';
import PaymentChannelSelect from './payment/PaymentChannelSelect';
import MobileMoneyFields from './payment/MobileMoneyFields';
import CardFields from './payment/CardFields';
import type { PaymentFormValues } from './payment/payment.types';
import { useI18n } from '@/i18n/i18n';

const FALLBACK_EMAIL = 'info@peekaboo.co.rw';

const defaultValues: PaymentFormValues = {
  channelName: PaymentChannel.MOMO,
  payerType: 'sender',
  customPhone: '',
  fallbackPhone: '',
  cardholderName: '',
  payerEmail: '',
};

const OrderPayment = () => {
  const { t } = useI18n();
  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { orderPaymentModal, selectedOrder } = useAppSelector((state) => state.order);
  const isPublic = pathname.startsWith('/p/orders');

  // Payers picked from the order have no form field of their own, so their
  // validation error is held here rather than in the form state.
  const [payerPhoneError, setPayerPhoneError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({ defaultValues });

  const channelName = useWatch({ control, name: 'channelName' });
  const payerType = useWatch({ control, name: 'payerType' });
  const customPhone = useWatch({ control, name: 'customPhone' });
  const isMobileMoney = isMobileMoneyChannel(channelName);

  const amount =
    selectedOrder?.finalFee ??
    selectedOrder?.quotedAmount ??
    selectedOrder?.initialFee ??
    0;

  // CLOSE MODAL
  const closeModal = useCallback(() => {
    dispatch(setOrderPaymentModal(false));
    dispatch(setSelectedOrder(undefined));
    reset(defaultValues);
    setPayerPhoneError('');
    setIsRedirecting(false);
  }, [dispatch, reset]);

  const { createPayment: createAuthPaymentMutation, isLoading: authPaymentLoading } =
    useCreatePayment();
  const {
    createPublicPayment: createPublicPaymentMutation,
    isLoading: publicPaymentLoading,
  } = useCreatePublicPayment();

  const isLoading = isPublic ? publicPaymentLoading : authPaymentLoading;
  const createPaymentMutation = isPublic
    ? createPublicPaymentMutation
    : createAuthPaymentMutation;

  // GET PAYER INFORMATION
  const getPayerInfo = useCallback(
    (values: PaymentFormValues): { phone?: string; email: string; name: string } => {
      if (values.payerType === 'sender') {
        return {
          phone: selectedOrder?.sender?.phoneNumber
            ? formatPhone(selectedOrder.sender.phoneNumber, 'RW')
            : selectedOrder?.senderPhoneNumber
              ? formatPhone(selectedOrder.senderPhoneNumber, 'RW')
              : undefined,
          email: selectedOrder?.sender?.email || FALLBACK_EMAIL,
          name: selectedOrder?.sender?.name || selectedOrder?.senderName || t('orderPayment.payer.sender'),
        };
      }
      if (values.payerType === 'recipient') {
        return {
          phone: selectedOrder?.recipient?.phoneNumber
            ? formatPhone(selectedOrder.recipient.phoneNumber, 'RW')
            : selectedOrder?.recipientPhoneNumber
              ? formatPhone(selectedOrder.recipientPhoneNumber, 'RW')
              : undefined,
          email: selectedOrder?.recipient?.email || FALLBACK_EMAIL,
          name:
            selectedOrder?.recipient?.name || selectedOrder?.recipientName || t('orderPayment.payer.recipient'),
        };
      }
      return {
        phone: values.customPhone,
        email: FALLBACK_EMAIL,
        name: t('orderPayment.payer.other'),
      };
    },
    [selectedOrder, t],
  );

  // The number shown to the network-mismatch hint, before submit validation.
  const resolvedPayerPhone =
    payerType === 'other' ? customPhone : getPayerInfo({ ...defaultValues, payerType }).phone;

  // CREATE PAYMENT
  const createPayment = useCallback(
    async (values: PaymentFormValues) => {
      setPayerPhoneError('');
      const payerInfo = getPayerInfo(values);
      const isCard = values.channelName === PaymentChannel.CARD;

      const phoneValidation = validateAndFormatPhoneNumber(payerInfo.phone || '');
      const payerPhone = phoneValidation.isValid ? phoneValidation.e164 : null;

      // Mobile money charges a phone; cards don't need one at all.
      if (!isCard) {
        if (!payerPhone) {
          const message = !payerInfo.phone?.trim()
            ? t('orderPayment.noPayerPhone')
            : t('orderPayment.invalidPhone');
          setPayerPhoneError(message);
          return;
        }
        if (phoneValidation.type !== 'MOBILE') {
          setPayerPhoneError(t('orderPayment.mobilePhone'));
          return;
        }
      }

      const fallbackValidation = validateAndFormatPhoneNumber(values.fallbackPhone || '');
      const fallbackContactPhone = values.fallbackPhone?.trim()
        ? fallbackValidation.e164
        : undefined;

      const payload = {
        entityId: selectedOrder?.id,
        ...(isPublic && { orderId: selectedOrder?.id }),
        amount,
        currency: 'RWF',
        type: PaymentType.ORDER,
        description: selectedOrder?.notes,
        customerEmail: isCard ? values.payerEmail.trim() : payerInfo.email,
        customerName: isCard ? values.cardholderName.trim() : payerInfo.name,
        ...(payerPhone ? { customerPhone: payerPhone } : {}),
        channelName: values.channelName,
        method: values.channelName,
        metadata: {
          channelName: values.channelName,
          ...(fallbackContactPhone ? { fallbackContactPhone } : {}),
        },
      };

      try {
        const response = await createPaymentMutation(payload).unwrap();
        const paymentId = response?.data?.id;
        const paymentUrl =
          response?.paymentUrl ||
          response?.data?.paymentUrl ||
          response?.data?.metadata?.cardProcessingUrl;
        const initiationError = response?.data?.metadata?.initiationError;
        const orderId = selectedOrder?.id;

        if (initiationError) {
          toast.error(
            initiationError?.message ||
              t('orderPayment.initiationError'),
          );
          return;
        }

        if (isCard) {
          // Without a hosted checkout URL the card payment never started, so
          // don't send the user to the success page.
          if (!paymentUrl || !paymentId) {
            toast.error(
              t('orderPayment.cardStartError'),
            );
            return;
          }
          setIsRedirecting(true);
          window.location.href = paymentUrl;
          return;
        }

        if (orderId && paymentId) {
          closeModal();
          navigate(
            `/p/orders/${orderId}/payment-pending?paymentId=${paymentId}`,
          );
        } else {
          toast.error(t('orderPayment.trackingError'));
        }
      } catch (error: unknown) {
        console.error('Payment creation failed:', error);
        const apiError = error as {
          data?: { message?: string };
          error?: string;
        };
        const message =
          apiError?.data?.message ||
          apiError?.error ||
          t('orderPayment.initiationError');
        if (!isCard && /phone|mobile money|wallet/i.test(message)) {
          setPayerPhoneError(message);
        }
        toast.error(message);
      }
    },
    [
      amount,
      closeModal,
      createPaymentMutation,
      getPayerInfo,
      isPublic,
      navigate,
      selectedOrder,
      t,
    ],
  );

  // RESET THE PAYER ERROR WHEN THE PAYER OR CHANNEL CHANGES
  useEffect(() => {
    setPayerPhoneError('');
  }, [payerType, channelName]);

  // PREFILL CARD DETAILS FROM THE ORDER
  useEffect(() => {
    if (!selectedOrder) return;
    reset(
      (current) => ({
        ...current,
        cardholderName:
          current.cardholderName ||
          selectedOrder.sender?.name ||
          selectedOrder.senderName ||
          '',
        payerEmail:
          current.payerEmail ||
          selectedOrder.contactEmail ||
          (selectedOrder.sender?.email !== FALLBACK_EMAIL
            ? (selectedOrder.sender?.email ?? '')
            : ''),
      }),
      { keepDefaultValues: true },
    );
  }, [selectedOrder, reset]);

  return (
    <Modal
      isOpen={orderPaymentModal}
      onClose={closeModal}
      className="min-w-[50vw]"
      heading={t('orderPayment.title')}
      description={t('orderPayment.description')}
    >
      <form
        className="w-full flex flex-col gap-4"
        onSubmit={handleSubmit((values) => void createPayment(values))}
      >
        <PaymentChannelSelect
          value={channelName}
          onChange={(channel) =>
            reset((current) => ({ ...current, channelName: channel }), {
              keepDefaultValues: true,
              keepErrors: false,
            })
          }
        />

        {isMobileMoney ? (
          <MobileMoneyFields
            control={control}
            errors={errors}
            channelName={channelName}
            payerType={payerType}
            senderLabel={selectedOrder?.senderName || selectedOrder?.sender?.name}
            recipientLabel={
              selectedOrder?.recipientName || selectedOrder?.recipient?.name
            }
            payerPhone={resolvedPayerPhone}
            payerPhoneError={payerPhoneError}
          />
        ) : (
          <CardFields control={control} errors={errors} />
        )}

        <p className="flex items-center justify-between border-t border-(--line) pt-3 text-sm">
          <span className="text-(--muted)">{t('orderPayment.amountDue')}</span>
          <span className="font-normal text-(--ink)">{formatCurrency(amount)}</span>
        </p>

        {ENVIRONMENTS.isPaymentSimulation ? (
          <p className="text-xs font-normal leading-snug text-(--ink)">
            {t('orderPayment.simulation')}
          </p>
        ) : null}
        {ENVIRONMENTS.isDevPrice ? (
          <p className="text-xs font-normal leading-snug text-(--ink)">
            {t('orderPayment.devPrice', {
              fee: formatCurrency(amount),
              amount: formatCurrency(DEVELOPMENT_PAYMENT_AMOUNT_RWF),
            })}
          </p>
        ) : null}

        <Button submit primary isLoading={isLoading || isRedirecting}>
          {isRedirecting
            ? t('orderPayment.redirecting')
            : isMobileMoney
              ? t('orderPayment.payAmount', { amount: formatCurrency(amount) })
              : t('orderPayment.continueCard')}
        </Button>
      </form>
    </Modal>
  );
};

export default OrderPayment;
