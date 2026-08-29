import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import StepTrail from '@/components/orders/StepTrail';
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
import { useI18n } from '@/i18n/i18n';

const POLLING_INTERVAL_MS = 3000;

const PublicOrderPaymentPending = () => {
  const { t } = useI18n();
  useDocumentTitle(t('payment.pending.docTitle'));
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
    if (!payment?.method) return t('payment.label');
    return (
      PAYMENT_CHANNEL_LABELS[payment.method as PaymentChannel] ||
      payment.method.replaceAll('_', ' ')
    );
  }, [payment?.method, t]);
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
              {t('payment.pending.missingTitle')}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-(--muted)">
              {t('payment.pending.missingDescription')}
            </p>
            {id ? (
              <Button primary route={`/p/orders/${id}`} className="mt-6">
                {t('payment.returnOrder')}
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
        eyebrow={isFailed ? t('payment.pending.stopped') : t('payment.pending.inProgress')}
        title={
          isFailed
            ? t('payment.pending.failedTitle')
            : t('payment.pending.phoneTitle')
        }
        description={
          isFailed
            ? t('payment.pending.failedDescription')
            : isMobilePayment
              ? t('payment.pending.mobileDescription')
              : t('payment.pending.checkoutDescription')
        }
        actions={
          <span
            className={`inline-flex h-6 items-center gap-2 rounded-(--radius-pill) border px-2.5 text-xs font-normal ${
              isFailed
                ? 'border-(--danger-line) bg-(--danger-surface) text-(--danger)'
                : 'border border-(--line-strong) text-(--muted)'
            }`}
          >
            <FontAwesomeIcon
              icon={isFailed ? faTriangleExclamation : faShieldHalved}
              aria-hidden="true"
            />
            {isFailed ? t('payment.notCompleted') : t('payment.secureCheckout')}
          </span>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(17rem,0.7fr)] lg:items-start">
        <PublicSectionCard
          eyebrow={t('payment.confirmation')}
          title={isFailed ? t('payment.pending.attention') : t('payment.pending.waitingApproval')}
          description={
            isFailed
              ? t('payment.pending.attemptEnded')
              : t('payment.pending.keepOpen')
          }
        >
          <StepTrail
            label={t('payment.pending.progress')}
            steps={[
              {
                key: 'initiated',
                label: t('payment.pending.initiated'),
                description: t('payment.pending.requestSent'),
                icon: faCircleCheck,
                state: 'done',
              },
              {
                key: 'confirmation',
                label: isFailed ? t('payment.notCompleted') : t('payment.confirmation'),
                description: isFailed ? t('payment.pending.tryAgain') : t('payment.pending.waitingSecurely'),
                icon: isFailed ? faTriangleExclamation : faArrowsRotate,
                state: isFailed ? 'upcoming' : 'current',
              },
            ]}
          />

          <div
            className={`mt-7 flex items-start gap-3 rounded-(--radius-control) border px-4 py-3 text-sm leading-6 ${ isFailed ? 'border-(--danger-line) bg-(--danger-surface) text-(--danger)' : 'border border-(--line-strong) bg-(--surface) text-(--ink)' }`}
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
                ? t('payment.pending.providerFailed')
                : statusQuery.error
                  ? t('payment.pending.connection')
                  : statusQuery.isLoading || hasTrackingError
                    ? t('payment.pending.finding')
                    : t('payment.pending.waitingProvider')}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {isFailed ? (
              <Button primary route={`/p/orders/${id}`}>
                {t('payment.returnOrder')}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => void refetchPaymentStatus()}
              >
                {t('payment.pending.checkAgain')}
              </Button>
            )}
            <Button route={`/p/orders/${id}`}>{t('payment.viewOrder')}</Button>
          </div>
        </PublicSectionCard>

        <PublicSectionCard eyebrow={t('payment.label')} title={t('payment.pending.attemptDetails')}>
          <dl className="divide-y divide-(--line) text-sm">
            <div className="pb-4">
              <dt className="type-meta">{t('payment.method')}</dt>
              <dd className="mt-1 font-normal text-(--ink)">
                {payment ? channelLabel : t('common.loading')}
              </dd>
            </div>
            <div className="py-4">
              <dt className="type-meta">
                {t('payment.orderReference')}
              </dt>
              <dd className="mt-1 break-all text-xs text-(--ink)">
                {orderLoading ? t('common.loading') : currentOrder?.referenceId || '—'}
              </dd>
            </div>
            <div className="pt-4">
              <dt className="type-meta">{t('payment.amount')}</dt>
              <dd className="type-metric mt-1">
                {payment
                  ? formatCurrency(payment.amount)
                  : orderLoading
                    ? t('common.loading')
                    : formatCurrency(
                        currentOrder?.finalFee ?? currentOrder?.initialFee ?? 0,
                      )}
              </dd>
            </div>
          </dl>
          <p className="mt-6 border-t border-(--line) pt-4 text-xs leading-5 text-(--muted)">
            {t('payment.pending.closeNote')}
          </p>
        </PublicSectionCard>
      </div>
    </PublicPage>
  );
};

export default PublicOrderPaymentPending;
