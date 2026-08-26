import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/states/hooks';
import { useGetPublicOrder } from '@/hooks/orders/orders.hooks';
import { KpayPaymentStatus } from '@/types/payment.types';
import type { UUID } from '@/types';
import Button from '@/components/inputs/Button';
import AdministrativeLocation from '@/containers/locations/AdministrativeLocation';
import { formatCurrency } from '@/utils/strings.util';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCopy } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useGetPublicPaymentStatusQuery } from '@/api/queries/payments.queries';
import {
  OrderStageRail,
  PublicPage,
  PublicPageHero,
  PublicSectionCard,
} from '@/components/layout/PublicPage';

const SkeletonLine = ({ className = '' }: { className?: string }) => (
  <span
    className={`inline-block animate-pulse rounded bg-[var(--peekaboo-gray)] ${className}`}
  />
);

interface ReferenceValueProps {
  value?: string;
  label: string;
  copied: boolean;
  onCopy: () => void;
}

const ReferenceValue = ({
  value,
  label,
  copied,
  onCopy,
}: ReferenceValueProps) => (
  <span className="flex min-w-0 items-center gap-2">
    <code className="min-w-0 break-all font-['IBM_Plex_Mono'] text-xs text-[var(--peekaboo-text)]">
      {value || '—'}
    </code>
    {value ? (
      <button
        type="button"
        onClick={onCopy}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--peekaboo-line)] bg-white text-[var(--peekaboo-muted)] hover:border-[var(--peekaboo-dark)] hover:text-[var(--peekaboo-dark)]"
        aria-label={`Copy ${label} to clipboard`}
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
  const [copiedReference, setCopiedReference] = useState<
    'payment' | 'order' | null
  >(null);
  useDocumentTitle('Payment Successful');
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
    toast.success(
      `${field === 'payment' ? 'Payment' : 'Order'} reference copied`,
    );
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
          <div className="py-5 text-center" role="status" aria-live="polite">
            <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[var(--peekaboo-line)] border-t-[var(--peekaboo-dark)] motion-reduce:animate-none" />
            <h1 className="mt-5 text-xl font-medium text-[var(--peekaboo-dark)]">
              Confirming your payment
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--peekaboo-muted)]">
              We’re checking the transaction before showing your receipt.
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
            <h1 className="text-xl font-medium text-[var(--peekaboo-dark)]">
              Payment confirmation unavailable
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--peekaboo-muted)]">
              We couldn’t verify a completed payment for this order. Return to
              the order to check its current status.
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
        eyebrow="Payment complete"
        title="Payment confirmed"
        description="Your order is paid and ready for rider assignment. Keep the references below for your records."
        actions={
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--peekaboo-gray)] px-3 py-2 text-xs font-medium text-[var(--peekaboo-dark)]">
            <FontAwesomeIcon icon={faCheckCircle} aria-hidden="true" />
            Confirmed
          </span>
        }
      />

      <OrderStageRail currentStage="payment" />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)] lg:items-start">
        <div className="space-y-5">
          <PublicSectionCard
            eyebrow="Receipt"
            title="Payment details"
            description="Transaction and order references."
          >
            <dl className="divide-y divide-[var(--peekaboo-line)]">
              {successfulPayment.externalReferenceId ? (
                <div className="grid gap-2 py-4 first:pt-0 sm:grid-cols-[10rem_1fr] sm:items-center">
                  <dt className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] text-[var(--peekaboo-muted)]">
                    Payment reference
                  </dt>
                  <dd className="sm:justify-self-end">
                    <ReferenceValue
                      value={successfulPayment.externalReferenceId}
                      label="payment reference"
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
                <dt className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] text-[var(--peekaboo-muted)]">
                  Order reference
                </dt>
                <dd className="sm:justify-self-end">
                  {orderLoading ? (
                    <SkeletonLine className="h-6 w-36" />
                  ) : (
                    <ReferenceValue
                      value={currentOrder?.referenceId}
                      label="order reference"
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
                <dt className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] text-[var(--peekaboo-muted)]">
                  Amount paid
                </dt>
                <dd className="text-xl font-medium text-[var(--peekaboo-dark)] sm:justify-self-end">
                  {formatCurrency(successfulPayment.amount)}
                </dd>
              </div>
            </dl>
          </PublicSectionCard>

          <PublicSectionCard eyebrow="Route" title="Pickup and destination">
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
                  className="absolute left-2 top-5 hidden h-px w-[calc(50%-0.5rem)] bg-[var(--ink)] sm:block"
                />
                {[
                  {
                    label: 'Pickup',
                    location: currentOrder?.locationFrom,
                  },
                  {
                    label: 'Destination',
                    location: currentOrder?.locationTo,
                  },
                ].map((stop) => (
                  <article key={stop.label} className="relative min-w-0 pl-6">
                    <span className="absolute left-0 top-0.5 h-3 w-3 rounded-full bg-[var(--ink)]" />
                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] text-[var(--peekaboo-muted)]">
                      {stop.label}
                    </p>
                    <div className="mt-3 text-sm text-[var(--peekaboo-text)]">
                      {stop.location ? (
                        <AdministrativeLocation location={stop.location} />
                      ) : (
                        <p>Not set</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!orderLoading ? (
              <div className="mt-6 flex items-center justify-between border-t border-[var(--peekaboo-line)] pt-4">
                <span className="text-sm text-[var(--peekaboo-muted)]">
                  Delivery fee
                </span>
                <span className="font-medium text-[var(--peekaboo-dark)]">
                  {formatCurrency(
                    currentOrder?.finalFee ?? currentOrder?.initialFee ?? 0,
                  )}
                </span>
              </div>
            ) : null}
          </PublicSectionCard>
        </div>

        <PublicSectionCard
          eyebrow="Next"
          title="Track rider assignment"
          description="We’ll update the tracking page when a rider is assigned and as the delivery moves."
        >
          <p className="text-sm leading-6 text-[var(--peekaboo-muted)]">
            You can leave this receipt safely. Your order reference will remain
            available on the tracking page.
          </p>
          <Button
            primary
            route={`/p/orders/${id}/tracking`}
            className="mt-5 w-full"
          >
            Track order
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
          Back
        </Button>
      </footer>
    </PublicPage>
  );
};

export default PublicOrderPaymentSuccess;
