import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppSelector } from '@/states/hooks';
import { useGetOrder } from '@/hooks/orders/orders.hooks';
import { useFetchPayments } from '@/hooks/payments/payment.hooks';
import { KpayPaymentStatus, PaymentType } from '@/types/payment.types';
import type { UUID } from '@/types';
import Button from '@/components/inputs/Button';
import AdministrativeLocation from '@/containers/locations/AdministrativeLocation';
import { formatCurrency } from '@/utils/strings.util';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCopy } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';

const SkeletonLine = ({ className = '' }: { className?: string }) => (
  <span className={`inline-block animate-pulse rounded bg-slate-100 ${className}`} />
);

const PublicOrderPaymentSuccess = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  useDocumentTitle('Payment Successful');

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ps-visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.ps-reveal').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => { observerRef.current?.disconnect(); };
  }, []);

  const { id } = useParams();
  const { order } = useAppSelector((state) => state.order);
  const { paymentsList } = useAppSelector((state) => state.payment);

  const { getOrder, isFetching: orderLoading } = useGetOrder();
  const { fetchPayments, isFetching: paymentsLoading } = useFetchPayments();

  useEffect(() => {
    if (id) {
      getOrder({ id: id as UUID });
    }
  }, [id, getOrder]);

  useEffect(() => {
    if (order?.id) {
      fetchPayments({ entityId: order.id, paymentType: PaymentType.ORDER });
    }
  }, [fetchPayments, order?.id]);

  const successfulPayment = paymentsList?.find(
    (payment) => payment.status === KpayPaymentStatus.SUCCESSFUL
  );

  const handleCopyReferenceId = () => {
    if (order?.referenceId) {
      navigator.clipboard.writeText(order.referenceId);
      toast.success('Reference ID copied to clipboard');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .ps-reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .ps-reveal.ps-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .ps-reveal:nth-child(2) { transition-delay: 0.08s; }
        .ps-reveal:nth-child(3) { transition-delay: 0.16s; }
        .ps-reveal:nth-child(4) { transition-delay: 0.24s; }
      ` }} />

      <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <header className="ps-reveal mb-8 border border-slate-200 rounded-xl p-6 sm:p-8 text-center">
            <figure className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200">
              <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-primary" aria-hidden="true" />
            </figure>
            <p className="mb-2 text-xs uppercase tracking-widest text-slate-600">Payment confirmed</p>
            <h1 className="mb-2 text-xl text-slate-900 sm:text-2xl">
              Your order is ready for the next step
            </h1>
            <p className="text-sm text-slate-500">
              We&apos;ve received your payment and your delivery request is now moving into rider assignment.
            </p>
          </header>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">

            {/* Left column */}
            <div className="space-y-5">

              {/* Payment details */}
              <article className="ps-reveal border border-slate-200 rounded-xl p-5 sm:p-6">
                <header className="mb-4 border-b border-slate-100 pb-4">
                  <p className="text-xs uppercase tracking-widest text-slate-600 mb-1">Payment details</p>
                  <p className="text-sm text-slate-700">Transaction confirmation</p>
                </header>

                {paymentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <SkeletonLine className="h-3 w-28" />
                        <SkeletonLine className="h-3 w-36" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <dl className="space-y-4">
                    {successfulPayment && (
                      <div className="flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <dt className="text-xs text-slate-600 uppercase tracking-wide">Payment Reference</dt>
                        <dd className="text-sm text-slate-700">
                          <Link
                            to={`https://kpay.co.rw/transactions/${successfulPayment.externalReferenceId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline underline-offset-4 transition-opacity hover:opacity-70"
                          >
                            {successfulPayment.externalReferenceId}
                          </Link>
                        </dd>
                      </div>
                    )}

                    <div className="flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-xs text-slate-600 uppercase tracking-wide">Order Reference</dt>
                      <dd className="flex flex-wrap items-center gap-2">
                        {orderLoading ? (
                          <SkeletonLine className="h-6 w-40" />
                        ) : (
                          <>
                            <code className="break-all rounded-md bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                              {order?.referenceId ?? '—'}
                            </code>
                            {order?.referenceId && (
                              <button
                                type="button"
                                onClick={handleCopyReferenceId}
                                className="cursor-pointer rounded border border-slate-200 p-1.5 text-slate-600 transition-colors hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                aria-label="Copy reference ID to clipboard"
                              >
                                <FontAwesomeIcon
                                  icon={isCopied ? faCheckCircle : faCopy}
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </button>
                            )}
                          </>
                        )}
                      </dd>
                    </div>

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-xs text-slate-600 uppercase tracking-wide">Amount Paid</dt>
                      <dd className="text-lg text-slate-900">
                        {orderLoading ? (
                          <SkeletonLine className="h-6 w-24" />
                        ) : (
                          formatCurrency(order?.finalFee ?? order?.initialFee ?? 0)
                        )}
                      </dd>
                    </div>
                  </dl>
                )}
              </article>

              {/* Order summary */}
              <article className="ps-reveal border border-slate-200 rounded-xl p-5 sm:p-6">
                <header className="mb-5 border-b border-slate-100 pb-4">
                  <p className="text-xs uppercase tracking-widest text-slate-600 mb-1">Order summary</p>
                  <p className="text-sm text-slate-700">Pickup and delivery overview</p>
                </header>

                {orderLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-3">
                        <SkeletonLine className="h-3 w-24" />
                        <SkeletonLine className="h-3 w-36" />
                        <SkeletonLine className="h-3 w-28" />
                        <SkeletonLine className="h-3 w-32" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <section className="grid gap-4 sm:grid-cols-2">
                    <article className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                      <p className="mb-3 text-xs uppercase tracking-widest text-slate-600">Pickup</p>
                      {order?.locationFrom ? (
                        <ul className='space-y-2'>
                          <AdministrativeLocation location={order.locationFrom} />
                          </ul>
                      ) : (
                        <p className="text-sm text-slate-600">Not set</p>
                      )}
                    </article>

                    <article className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                      <p className="mb-3 text-xs uppercase tracking-widest text-slate-600">Destination</p>
                      {order?.locationTo ? (
                        <ul className='space-y-2'>
                          <AdministrativeLocation location={order.locationTo} />
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-600">Not set</p>
                      )}
                    </article>
                  </section>
                )}

                {!orderLoading && (
                  <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-600">Delivery fee</p>
                    </div>
                    <p className="text-base text-slate-900">
                      {formatCurrency(order?.finalFee ?? order?.initialFee ?? 0)}
                    </p>
                  </div>
                )}
              </article>
            </div>

            {/* Right column */}
            <aside className="space-y-5">
              <article className="ps-reveal border border-slate-200 rounded-xl p-5 sm:p-6">
                <header className="mb-4 border-b border-slate-100 pb-4">
                  <p className="text-xs uppercase tracking-widest text-slate-600 mb-1">What happens next</p>
                  <p className="text-sm text-slate-700">Delivery progress after payment</p>
                </header>

                <ol className="space-y-4">
                  {[
                    'Your order is being assigned to a nearby rider.',
                    'Once assigned, you can track your order in real time.',
                    'The rider will collect your package and head to the destination.',
                    'You\'ll receive updates as the delivery moves through each stage.',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-500">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-600 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </article>

              <div className="ps-reveal border border-slate-200 rounded-xl p-5 sm:p-6">
                <p className="mb-4 text-xs text-slate-600 uppercase tracking-widest">Continue</p>
                <nav aria-label="Order actions" className="flex flex-col gap-2.5">
                  <Button route={`/p/orders/${order?.id}`} className="cursor-pointer">
                    View Order Details
                  </Button>
                  <Button primary route={`/p/orders/${order?.id}/tracking`} className="cursor-pointer">
                    Track Order
                  </Button>
                </nav>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};

export default PublicOrderPaymentSuccess;
