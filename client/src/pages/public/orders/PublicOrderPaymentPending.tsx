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
      pollingInterval:
        isVisible && !stopPolling ? POLLING_INTERVAL_MS : 0,
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
      <main className="min-h-[70vh] bg-[#fafaf7] px-4 py-16 sm:px-6">
        <section className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-7 text-center shadow-[0_18px_60px_-45px_rgba(10,10,10,0.35)]">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="mb-4 h-6 w-6 text-amber-600"
          />
          <h1 className="text-xl font-bold text-slate-900">
            Payment reference missing
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Return to the order and start the payment again so we can track its
            confirmation.
          </p>
          {id ? (
            <Button primary route={`/p/orders/${id}`} className="mt-6">
              Return to order
            </Button>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[78vh] bg-[#fafaf7] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_80px_-58px_rgba(10,10,10,0.5)]">
          <div className="border-b border-slate-100 px-6 py-7 sm:px-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-amber-800">
                Secure confirmation
              </span>
              <FontAwesomeIcon
                icon={faShieldHalved}
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
            </div>

            <h1 className="max-w-xl text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {isFailed
                ? 'The payment was not completed'
                : 'Confirm the payment on your phone'}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              {isFailed
                ? 'No charge was confirmed. Return to the order to check the payer details or choose another payment method.'
                : isMobilePayment
                  ? 'Approve the mobile money prompt. This page will move forward automatically when the payment is confirmed.'
                  : 'Complete the provider checkout. This page will move forward automatically when the payment is confirmed.'}
            </p>
          </div>

          <div className="px-6 py-7 sm:px-8">
            <div
              className="relative grid grid-cols-2 gap-8"
              aria-label="Payment confirmation progress"
            >
              <span className="absolute left-[13px] right-[13px] top-[13px] h-px bg-slate-200" />
              {!isFailed ? (
                <span className="absolute left-[13px] top-[11px] h-[5px] w-[calc(50%-13px)] origin-left bg-[#edb100] motion-safe:animate-pulse motion-reduce:animate-none" />
              ) : null}
              <div className="relative">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0a0a0a] text-white">
                  <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" />
                </span>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-800">
                  Initiated
                </p>
                <p className="mt-1 text-xs text-slate-500">Request sent</p>
              </div>
              <div className="relative text-right">
                <span
                  className={`ml-auto flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white ${
                    isFailed
                      ? 'border-red-500 text-red-600'
                      : 'border-[#edb100] text-amber-700'
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
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-800">
                  {isFailed ? 'Not completed' : 'Confirmation'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {isFailed ? 'Try again' : 'Waiting securely'}
                </p>
              </div>
            </div>

            <div
              className={`mt-7 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                isFailed
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : statusQuery.error
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
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
                className="mt-0.5 h-4 w-4 shrink-0"
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
                  isLoading={statusQuery.isFetching}
                >
                  Check again
                </Button>
              )}
              <Button route={`/p/orders/${id}`}>View order</Button>
            </div>
          </div>
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 lg:self-start">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
            Payment details
          </p>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="border-b border-slate-100 pb-4">
              <dt className="text-xs text-slate-500">Method</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {payment ? channelLabel : 'Loading…'}
              </dd>
            </div>
            <div className="border-b border-slate-100 pb-4">
              <dt className="text-xs text-slate-500">Order reference</dt>
              <dd className="mt-1 break-all font-mono text-xs text-slate-800">
                {orderLoading ? 'Loading…' : currentOrder?.referenceId || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Amount</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950">
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
          <p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
            Keep this page open. Closing it does not cancel the payment; you can
            return using the same payment link.
          </p>
        </aside>
      </div>
    </main>
  );
};

export default PublicOrderPaymentPending;
