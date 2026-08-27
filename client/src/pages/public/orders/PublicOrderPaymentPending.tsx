import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowsRotate,
  faCircleCheck,
  faMobileScreenButton,
  faShieldHalved,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { useGetPublicPaymentStatusQuery } from '@/api/queries/payments.queries';
import Button from '@/components/inputs/Button';
import {
  OrderStageRail,
  PublicPage,
  PublicPageHero,
  PublicSectionCard,
} from '@/components/layout/PublicPage';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useGetPublicOrder } from '@/hooks/orders/orders.hooks';
import { useAppSelector } from '@/states/hooks';
import {
  KpayPaymentStatus,
  PAYMENT_CHANNEL_LABELS,
  PaymentChannel,
} from '@/types/payment.types';
import type { UUID } from '@/types';
import { formatCurrency } from '@/utils/strings.util';

const POLLING_INTERVAL_MS = 3000;

const PublicOrderPaymentPending = () => {
  useDocumentTitle('Confirming Payment');
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId') || '';
  const [isVisible, setIsVisible] = useState(() => !document.hidden);
  const [stopPolling, setStopPolling] = useState(false);
  const { order } = useAppSelector((state) => state.order);
  const currentOrder = order?.id === id ? order : undefined;
  const { getPublicOrder, isFetching: orderLoading } = useGetPublicOrder();

  useEffect(() => {
    if (id) getPublicOrder({ id: id as UUID });
  }, [getPublicOrder, id]);

  const statusQuery = useGetPublicPaymentStatusQuery(
    { paymentId, entityId: id || '' },
    {
      skip: !id || !paymentId,
      pollingInterval: isVisible && !stopPolling ? POLLING_INTERVAL_MS : 0,
    },
  );
  const refetchPaymentStatus = statusQuery.refetch;
  const payment = statusQuery.data?.data;
  const isFailed = payment?.status === KpayPaymentStatus.FAILED;
  const isSuccessful = payment?.status === KpayPaymentStatus.SUCCESSFUL;

  useEffect(() => {
    const refetchWhenVisible = () => {
      if (!document.hidden && paymentId && id) void refetchPaymentStatus();
    };

    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsVisible(visible);
      if (visible) refetchWhenVisible();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', refetchWhenVisible);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refetchWhenVisible);
    };
  }, [id, paymentId, refetchPaymentStatus]);

  useEffect(() => setStopPolling(false), [paymentId]);

  useEffect(() => {
    if (isFailed) setStopPolling(true);
  }, [isFailed]);

  useEffect(() => {
    if (isSuccessful && id) {
      navigate(`/p/orders/${id}/payment-success?paymentId=${paymentId}`, {
        replace: true,
      });
    }
  }, [id, isSuccessful, navigate, paymentId]);

  const channelLabel = useMemo(() => {
    if (!payment?.method) return 'Payment';
    return (
      PAYMENT_CHANNEL_LABELS[payment.method as PaymentChannel] ||
      payment.method.replaceAll('_', ' ')
    );
  }, [payment?.method]);
  const isMobilePayment =
    payment?.method === PaymentChannel.MOMO ||
    payment?.method === PaymentChannel.AIRTEL_MONEY;
  const hasTrackingError = Boolean(statusQuery.error) && !payment;

  if (!id || !paymentId) {
    return (
      <PublicPage>
        <PublicSectionCard className="mx-auto mt-8 w-full max-w-xl">
          <div className="py-5 text-center">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="mb-4 h-5 w-5 text-(--destructive)"
            />
            <h1 className="type-h3">
              Payment reference missing
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-(--muted)">
              Return to the order and start payment again so we can track its
              confirmation.
            </p>
            {id ? (
              <Button primary route={`/p/orders/${id}`} className="mt-6">
                Return to order
              </Button>
            ) : null}
          </div>
        </PublicSectionCard>
      </PublicPage>
    );
  }

  return (
    <PublicPage>
      <PublicPageHero
        eyebrow={isFailed ? 'Payment stopped' : 'Payment in progress'}
        title={
          isFailed
            ? 'The payment was not completed'
            : 'Confirm the payment on your phone'
        }
        description={
          isFailed
            ? 'No charge was confirmed. Check the payer details or choose another payment method.'
            : isMobilePayment
              ? 'Approve the mobile money prompt. This page will move forward automatically when the payment is confirmed.'
              : 'Complete the provider checkout. This page will move forward automatically when the payment is confirmed.'
        }
        actions={
          <span
            className={`inline-flex h-6 items-center gap-2 rounded-(--radius-pill) border px-2.5 text-xs font-normal ${
              isFailed
                ? 'border-(--ink) text-(--ink) line-through'
                : 'border-dashed border-(--line-strong) text-(--muted)'
            }`}
          >
            <FontAwesomeIcon
              icon={isFailed ? faTriangleExclamation : faShieldHalved}
              aria-hidden="true"
            />
            {isFailed ? 'Not completed' : 'Secure checkout'}
          </span>
        }
      />

      <OrderStageRail currentStage="payment" />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(17rem,0.7fr)] lg:items-start">
        <PublicSectionCard
          eyebrow="Confirmation"
          title={isFailed ? 'Payment needs attention' : 'Waiting for approval'}
          description={
            isFailed
              ? 'This attempt has ended. Return to the order to try again.'
              : 'Keep this page open while the provider confirms the charge.'
          }
        >
          <ol
            className="relative grid grid-cols-2 gap-8"
            aria-label="Payment confirmation progress"
          >
            <span
              aria-hidden="true"
              className="absolute left-3.5 right-3.5 top-3.5 h-px bg-(--line)"
            />
            {!isFailed ? (
              <span
                aria-hidden="true"
                className="absolute left-3.5 top-3.5 h-px w-[calc(50%-0.875rem)] bg-(--ink)"
              />
            ) : null}

            <li className="relative">
              <span className="flex h-7 w-7 items-center justify-center rounded-(--radius-pill) border border-(--ink) bg-(--paper) text-(--ink)">
                <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" />
              </span>
              <p className="mt-3 text-xs font-normal text-(--ink)">
                Initiated
              </p>
              <p className="type-meta mt-1">
                Request sent
              </p>
            </li>

            <li className="relative text-right">
              <span
                className={`ml-auto flex h-7 w-7 items-center justify-center rounded-full border border-(--line) ${
                  isFailed
                    ? 'border-(--ink) bg-(--paper) text-(--ink)'
                    : 'border-(--ink) bg-(--ink) text-(--paper)'
                }`}
              >
                <FontAwesomeIcon
                  icon={isFailed ? faTriangleExclamation : faArrowsRotate}
                  className={`h-3 w-3 ${
                    isFailed
                      ? ''
                      : 'motion-safe:animate-spin motion-reduce:animate-none'
                  }`}
                />
              </span>
              <p className="mt-3 text-xs font-normal text-(--ink)">
                {isFailed ? 'Not completed' : 'Confirmation'}
              </p>
              <p className="type-meta mt-1">
                {isFailed ? 'Try again' : 'Waiting securely'}
              </p>
            </li>
          </ol>

          <div
            className={`mt-7 flex items-start gap-3 rounded-(--radius-control) px-4 py-3 text-sm leading-6 ${ isFailed ? ' border-(--ink) bg-(--paper) text-(--ink)' : ' border-dashed border-(--line-strong) bg-(--surface) text-(--ink)' }`}
            role="status"
            aria-live="polite"
          >
            <FontAwesomeIcon
              icon={
                isFailed
                  ? faTriangleExclamation
                  : isMobilePayment
                    ? faMobileScreenButton
                    : faShieldHalved
              }
              className="mt-1 h-4 w-4 shrink-0"
            />
            <span>
              {isFailed
                ? 'UrubutoPay reported that this attempt failed or was cancelled.'
                : statusQuery.error
                  ? 'Connection interrupted. We are still checking automatically.'
                  : statusQuery.isLoading || hasTrackingError
                    ? 'Finding your payment status…'
                    : 'Waiting for UrubutoPay to confirm the payment.'}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {isFailed ? (
              <Button primary route={`/p/orders/${id}`}>
                Return to order
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => void refetchPaymentStatus()}
              >
                Check again
              </Button>
            )}
            <Button route={`/p/orders/${id}`}>View order</Button>
          </div>
        </PublicSectionCard>

        <PublicSectionCard eyebrow="Payment" title="Attempt details">
          <dl className="divide-y divide-(--line) text-sm">
            <div className="pb-4">
              <dt className="type-meta">Method</dt>
              <dd className="mt-1 font-normal text-(--ink)">
                {payment ? channelLabel : 'Loading…'}
              </dd>
            </div>
            <div className="py-4">
              <dt className="type-meta">
                Order reference
              </dt>
              <dd className="mt-1 break-all text-xs text-(--ink)">
                {orderLoading ? 'Loading…' : currentOrder?.referenceId || '—'}
              </dd>
            </div>
            <div className="pt-4">
              <dt className="type-meta">Amount</dt>
              <dd className="type-metric mt-1">
                {payment
                  ? formatCurrency(payment.amount)
                  : orderLoading
                    ? 'Loading…'
                    : formatCurrency(
                        currentOrder?.finalFee ?? currentOrder?.initialFee ?? 0,
                      )}
              </dd>
            </div>
          </dl>
          <p className="mt-6 border-t border-(--line) pt-4 text-xs leading-5 text-(--muted)">
            Closing this page doesn’t cancel the payment. You can return using
            the same link.
          </p>
        </PublicSectionCard>
      </div>
    </PublicPage>
  );
};

export default PublicOrderPaymentPending;
