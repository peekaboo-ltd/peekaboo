import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/states/hooks';
import { useGetPublicOrder } from '@/hooks/orders/orders.hooks';
import { KpayPaymentStatus } from '@/types/payment.types';
import type { UUID } from '@/types';
import Button from '@/components/inputs/Button';
import { LoadingItem } from '@/components/ui/loading-item';
import AdministrativeLocation from '@/containers/locations/AdministrativeLocation';
import { formatCurrency } from '@/utils/strings.util';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCopy } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useGetPublicPaymentStatusQuery } from '@/api/queries/payments.queries';
import {
  PublicPage,
  PublicPageHero,
  PublicSectionCard,
} from '@/components/layout/PublicPage';
import { useI18n } from '@/i18n/i18n';

const SkeletonLine = ({ className = '' }: { className?: string }) => (
  <span
    className={`inline-block animate-pulse rounded bg-(--surface) ${className}`}
  />
);

interface ReferenceValueProps {
  value?: string;
  copied: boolean;
  onCopy: () => void;
  copyLabel: string;
}

const ReferenceValue = ({
  value,
  copied,
  onCopy,
  copyLabel,
}: ReferenceValueProps) => (
  <span className="flex min-w-0 items-center gap-2">
    <span className="min-w-0 break-all text-xs text-(--ink) tabular-nums">
      {value || '—'}
    </span>
    {value ? (
      <button
        type="button"
        onClick={onCopy}
        className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-control) border border-(--line) bg-(--paper) text-(--muted) outline-none transition-[background-color,color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0,0,1,1)] hover:border-(--ink) hover:text-(--ink) active:shadow-[var(--press-on-paper)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
        aria-label={copyLabel}
      >
        <FontAwesomeIcon
          icon={copied ? faCheckCircle : faCopy}
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />
      </button>
    ) : null}
  </span>
);

const PublicOrderPaymentSuccess = () => {
  const { t } = useI18n();
  const [copiedReference, setCopiedReference] = useState<
    'payment' | 'order' | null
  >(null);
  useDocumentTitle(t('payment.success.docTitle'));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId') || '';

  const { id } = useParams();
  const { order } = useAppSelector((state) => state.order);
  const currentOrder = order?.id === id ? order : undefined;

  const { getPublicOrder, isFetching: orderLoading } = useGetPublicOrder();
  const exactPaymentQuery = useGetPublicPaymentStatusQuery(
    { paymentId, entityId: id || '' },
    { skip: !id || !paymentId },
  );

  useEffect(() => {
    if (id) getPublicOrder({ id: id as UUID });
  }, [getPublicOrder, id]);

  useEffect(() => {
    const exactPayment = exactPaymentQuery.data?.data;
    if (
      id &&
      paymentId &&
      exactPayment &&
      exactPayment.status !== KpayPaymentStatus.SUCCESSFUL
    ) {
      navigate(`/p/orders/${id}/payment-pending?paymentId=${paymentId}`, {
        replace: true,
      });
    }
  }, [exactPaymentQuery.data?.data, id, navigate, paymentId]);

  const exactPayment = exactPaymentQuery.data?.data;
  const successfulPayment =
    exactPayment?.status === KpayPaymentStatus.SUCCESSFUL
      ? exactPayment
      : undefined;

  const copyReference = (value: string, field: 'payment' | 'order') => {
    void navigator.clipboard.writeText(value);
    toast.success(t('payment.success.referenceCopied', {
      type: field === 'payment' ? t('payment.label') : t('tracking.orderReference'),
    }));
    setCopiedReference(field);
    window.setTimeout(() => setCopiedReference(null), 2000);
  };

  if (
    paymentId &&
    !exactPaymentQuery.error &&
    (exactPaymentQuery.isLoading ||
      exactPaymentQuery.isFetching ||
      !successfulPayment)
  ) {
    return (
      <PublicPage>
        <PublicSectionCard className="mx-auto mt-8 w-full max-w-xl">
          <div className="py-5" role="status" aria-live="polite">
            <LoadingItem
              title={t('payment.success.confirmingTitle')}
              className="mx-auto max-w-md"
            />
            <p className="mx-auto mt-2 max-w-md text-center text-sm leading-6 text-(--muted)">
              {t('payment.success.confirmingDescription')}
            </p>
          </div>
        </PublicSectionCard>
      </PublicPage>
    );
  }

  if (!successfulPayment || exactPaymentQuery.error) {
    return (
      <PublicPage>
        <PublicSectionCard className="mx-auto mt-8 w-full max-w-xl">
          <div className="py-5 text-center">
            <h1 className="type-h3">
              {t('payment.success.unavailableTitle')}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-(--muted)">
              {t('payment.success.unavailableDescription')}
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
        eyebrow={t('payment.success.complete')}
        title={t('payment.success.confirmedTitle')}
        description={t('payment.success.confirmedDescription')}
        actions={
          <span className="inline-flex h-6 items-center gap-2 rounded-(--radius-pill) border border-(--approve-line) bg-(--approve-surface) px-2.5 text-xs font-normal text-(--approve)">
            <FontAwesomeIcon icon={faCheckCircle} aria-hidden="true" />
            {t('payment.success.confirmed')}
          </span>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)] lg:items-start">
        <div className="space-y-5">
          <PublicSectionCard
            eyebrow={t('payment.success.receipt')}
            title={t('payment.success.details')}
            description={t('payment.success.detailsDescription')}
          >
            <dl className="divide-y divide-(--line)">
              {successfulPayment.externalReferenceId ? (
                <div className="grid gap-2 py-4 first:pt-0 sm:grid-cols-[10rem_1fr] sm:items-center">
                  <dt className="type-meta">
                    {t('payment.paymentReference')}
                  </dt>
                  <dd className="sm:justify-self-end">
                    <ReferenceValue
                      value={successfulPayment.externalReferenceId}
                      copyLabel={t('payment.copyLabel', { label: t('payment.paymentReference') })}
                      copied={copiedReference === 'payment'}
                      onCopy={() =>
                        copyReference(
                          successfulPayment.externalReferenceId,
                          'payment',
                        )
                      }
                    />
                  </dd>
                </div>
              ) : null}

              <div className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr] sm:items-center">
                <dt className="type-meta">
                  {t('payment.orderReference')}
                </dt>
                <dd className="sm:justify-self-end">
                  {orderLoading ? (
                    <SkeletonLine className="h-6 w-36" />
                  ) : (
                    <ReferenceValue
                      value={currentOrder?.referenceId}
                      copyLabel={t('payment.copyLabel', { label: t('payment.orderReference') })}
                      copied={copiedReference === 'order'}
                      onCopy={() => {
                        if (currentOrder?.referenceId) {
                          copyReference(currentOrder.referenceId, 'order');
                        }
                      }}
                    />
                  )}
                </dd>
              </div>

              <div className="grid gap-2 py-4 pb-0 sm:grid-cols-[10rem_1fr] sm:items-center">
                <dt className="type-meta">
                  {t('payment.success.amountPaid')}
                </dt>
                <dd className="type-metric sm:justify-self-end">
                  {formatCurrency(successfulPayment.amount)}
                </dd>
              </div>
            </dl>
          </PublicSectionCard>

          <PublicSectionCard eyebrow={t('payment.success.route')} title={t('payment.success.pickupDestination')}>
            {orderLoading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[1, 2].map((item) => (
                  <div key={item} className="space-y-3">
                    <SkeletonLine className="h-3 w-20" />
                    <SkeletonLine className="h-4 w-36" />
                    <SkeletonLine className="h-4 w-28" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative grid gap-6 sm:grid-cols-2 sm:gap-10">
                <span
                  aria-hidden="true"
                  className="absolute left-2 top-5 hidden h-px w-[calc(50%-0.5rem)] bg-(--ink) sm:block"
                />
                {[
                  {
                    label: t('payment.pickup'),
                    location: currentOrder?.locationFrom,
                  },
                  {
                    label: t('payment.destination'),
                    location: currentOrder?.locationTo,
                  },
                ].map((stop) => (
                  <article key={stop.label} className="relative min-w-0 pl-6">
                    <span className="absolute left-0 top-0.5 h-3 w-3 rounded-full bg-(--ink)" />
                    <p className="type-meta">
                      {stop.label}
                    </p>
                    <div className="mt-3 text-sm text-(--ink)">
                      {stop.location ? (
                        <AdministrativeLocation location={stop.location} />
                      ) : (
                        <p>{t('common.notSet')}</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!orderLoading ? (
              <div className="mt-6 flex items-center justify-between border-t border-(--line) pt-4">
                <span className="text-sm text-(--muted)">
                  {t('payment.deliveryFee')}
                </span>
                <span className="font-normal text-(--ink)">
                  {formatCurrency(
                    currentOrder?.finalFee ?? currentOrder?.initialFee ?? 0,
                  )}
                </span>
              </div>
            ) : null}
          </PublicSectionCard>
        </div>

        <PublicSectionCard
          eyebrow={t('payment.success.next')}
          title={t('payment.success.trackAssignment')}
          description={t('payment.success.trackDescription')}
        >
          <p className="text-sm leading-6 text-(--muted)">
            {t('payment.success.leaveReceipt')}
          </p>
          <Button
            primary
            route={`/p/orders/${id}/tracking`}
            className="mt-5 w-full"
          >
            {t('payment.trackOrder')}
          </Button>
        </PublicSectionCard>
      </div>

      <footer>
        <Button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            navigate(-1);
          }}
        >
          {t('tracking.back')}
        </Button>
      </footer>
    </PublicPage>
  );
};

export default PublicOrderPaymentSuccess;
