import { useFetchOrderActivities } from '@/hooks/orders/orderActivities.hooks';
import { useAppSelector } from '@/states/hooks';
import type { UUID } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { OrderStatus } from '@/types/order.type';
import { useGetOrder } from '@/hooks/orders/orders.hooks';
import { faCopy, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { OrderActivity } from '@/types/orderActivity.type';
import OrderDetails from '@/containers/orders/OrderDetails';
import { toast } from 'sonner';
import { workflowStatuses } from '@/constants/order.constants';
import Button from '@/components/inputs/Button';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';

const SkeletonLine = ({ className = '' }: { className?: string }) => (
  <span className={`inline-block animate-pulse rounded bg-slate-100 ${className}`} />
);

const PublicOrderTracking = () => {
  useDocumentTitle('Order Tracking');

  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('pot-visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.pot-reveal').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const { orderActivitiesList } = useAppSelector((state) => state.orderActivity);
  const { order } = useAppSelector((state) => state.order);
  const [currentStatus, setCurrentStatus] = useState<OrderActivity | undefined>(undefined);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { fetchOrderActivities } = useFetchOrderActivities();
  const { getOrder, isFetching: orderLoading } = useGetOrder();

  useEffect(() => {
    if (id) {
      getOrder({ id: id as UUID });
    }
  }, [id, getOrder]);

  useEffect(() => {
    if (order?.id) {
      fetchOrderActivities({
        orderId: order.id,
      });
    }
  }, [fetchOrderActivities, order?.id]);

  useEffect(() => {
    if (orderActivitiesList?.[0]) {
      setCurrentStatus(orderActivitiesList[0]);
    }
  }, [orderActivitiesList]);

  const currentStepIndex = workflowStatuses.findIndex(
    (status) => status.key === currentStatus?.status
  );

  const statusActivityMap = new Map<OrderStatus, OrderActivity>();
  orderActivitiesList?.forEach((activity) => {
    if (!statusActivityMap.has(activity.status)) {
      statusActivityMap.set(activity.status, activity);
    }
  });

  const furthestActivityIndex = workflowStatuses.reduce((maxIndex, status, index) => {
    return statusActivityMap.has(status.key) ? Math.max(maxIndex, index) : maxIndex;
  }, -1);

  const formatTimestamp = (date: Date | string) => {
    const activityDate = new Date(date);
    const today = new Date();
    const isToday = activityDate.toDateString() === today.toDateString();

    if (isToday) {
      return activityDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }

    return activityDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .pot-reveal {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
          }
          .pot-reveal.pot-visible {
            opacity: 1;
            transform: translateY(0);
          }
          .pot-reveal:nth-child(2) { transition-delay: 0.08s; }
          .pot-reveal:nth-child(3) { transition-delay: 0.16s; }
          .pot-reveal:nth-child(4) { transition-delay: 0.24s; }
        `,
        }}
      />

      <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-10">
        <section className="mx-auto max-w-5xl">

          {/* Header */}
          <header className="pot-reveal mb-8 rounded-xl border border-slate-200 p-6 text-center sm:p-8">
            <p className="mb-2 text-xs uppercase tracking-widest text-primary">Order tracking</p>
            <h1 className="mb-2 text-xl text-slate-900 sm:text-2xl">Follow your delivery</h1>
            <p className="text-sm text-slate-500">
              See the latest progress updates and review your order details in one place.
            </p>

            {orderLoading ? (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <SkeletonLine className="h-4 w-28" />
                <SkeletonLine className="h-6 w-40" />
              </div>
            ) : order && (
              <section className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600">
                <span>Order Reference</span>
                <code className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                  {order.referenceId}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(order.referenceId);
                    toast.success('Reference ID copied to clipboard');
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="cursor-pointer rounded border border-slate-200 p-1.5 text-slate-600 transition-colors hover:border-primary hover:text-primary"
                  aria-label="Copy reference ID"
                >
                  <FontAwesomeIcon
                    icon={isCopied ? faCheckCircle : faCopy}
                    className="h-3.5 w-3.5"
                  />
                </button>
              </section>
            )}
          </header>

          {/* Order details */}
          <article className="pot-reveal mb-5 rounded-xl border border-slate-200 p-5 sm:p-6">
            <header className="mb-5 border-b border-slate-100 pb-4">
              <p className="mb-1 text-xs uppercase tracking-widest text-slate-600">Order details</p>
              <h2 className="text-sm text-slate-700">Reference and delivery information</h2>
            </header>
            {orderLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <SkeletonLine className="h-3 w-20" />
                    <SkeletonLine className="h-4 w-28" />
                  </div>
                ))}
              </div>
            ) : (
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <OrderDetails order={order} />
              </dl>
            )}
          </article>

          {/* Timeline */}
          <article className="pot-reveal mb-5 rounded-xl border border-slate-200 p-5 sm:p-6">
            <header className="mb-5 border-b border-slate-100 pb-4">
              <p className="mb-1 text-xs uppercase tracking-widest text-slate-600">Timeline</p>
              <h2 className="text-sm text-slate-700">Order progress</h2>
            </header>

            <nav className="relative">
              {/* Mobile: vertical list */}
              <ol className="space-y-6 sm:hidden">
                <span
                  className="absolute left-5 top-0 bottom-0 w-px bg-slate-200"
                  aria-hidden="true"
                />
                <span
                  className="absolute left-5 top-0 w-px bg-primary transition-all duration-700"
                  style={{
                    height:
                      furthestActivityIndex >= 0
                        ? `${((furthestActivityIndex + 1) / workflowStatuses.length) * 100}%`
                        : '0%',
                  }}
                  aria-label="Order progress"
                />

                {workflowStatuses.map((status, index) => {
                  const hasActivity = statusActivityMap.has(status.key);
                  const isCurrent = index === currentStepIndex;
                  const isCompleted = hasActivity && index < currentStepIndex;
                  const activity = statusActivityMap.get(status.key);

                  return (
                    <li
                      key={status.key}
                      className="relative flex items-start gap-4"
                      onMouseEnter={() => setHoveredStatus(status.key as string)}
                      onMouseLeave={() => setHoveredStatus(null)}
                    >
                      <span
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm transition-colors ${
                          isCompleted || isCurrent
                            ? 'border-primary bg-primary text-white'
                            : hasActivity
                              ? 'border-primary/20 bg-primary/5 text-primary'
                              : 'border-slate-200 bg-white text-slate-400'
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={isCompleted ? faCheckCircle : status.icon}
                          className="h-4 w-4"
                        />
                      </span>

                      <section className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <header className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={`text-sm ${hasActivity || isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>
                              {status.label}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">{status.description}</p>
                          </div>
                          <aside className="shrink-0 text-right">
                            {isCurrent && (
                              <span className="inline-flex rounded-md border border-primary/15 bg-primary/5 px-2 py-1 text-[10px] uppercase tracking-wide text-primary">
                                Current
                              </span>
                            )}
                            {activity?.createdAt && (
                              <time
                                className={`mt-1 block text-[10px] ${hasActivity || isCurrent ? 'text-slate-700' : 'text-slate-400'}`}
                              >
                                {formatTimestamp(activity.createdAt)}
                              </time>
                            )}
                          </aside>
                        </header>

                        {hoveredStatus === (status.key as string) && (
                          <p className="mt-2 text-xs text-slate-600">
                            {(
                              activity as OrderActivity & {
                                notes?: string;
                                description?: string;
                              }
                            )?.notes ||
                              (
                                activity as OrderActivity & {
                                  notes?: string;
                                  description?: string;
                                }
                              )?.description ||
                              status.description}
                          </p>
                        )}
                      </section>
                    </li>
                  );
                })}
              </ol>

              {/* Desktop: horizontal stepper */}
              <section className="hidden overflow-x-auto pb-2 sm:block">
                <span
                  className="absolute left-6 right-6 top-5 h-px bg-slate-200"
                  aria-hidden="true"
                />
                <span
                  className="absolute top-5 h-px bg-primary transition-all duration-700"
                  style={{
                    left: '1.5rem',
                    width:
                      furthestActivityIndex >= 0
                        ? `calc(${(furthestActivityIndex / (workflowStatuses.length - 1)) * 100}% - 3rem)`
                        : '0%',
                  }}
                  aria-label="Order progress"
                />

                <ol className="relative flex min-w-[720px] justify-between gap-4">
                  {workflowStatuses.map((status, index) => {
                    const hasActivity = statusActivityMap.has(status.key);
                    const isCurrent = index === currentStepIndex;
                    const isCompleted = hasActivity && index < currentStepIndex;
                    const activity = statusActivityMap.get(status.key);

                    return (
                      <li
                        key={status.key}
                        className="relative mt-1 flex flex-1 flex-col items-center"
                        onMouseEnter={() => setHoveredStatus(status.key as string)}
                        onMouseLeave={() => setHoveredStatus(null)}
                      >
                        <span
                          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm transition-colors ${
                            isCompleted || isCurrent
                              ? 'border-primary bg-primary text-white'
                              : hasActivity
                                ? 'border-primary/20 bg-primary/5 text-primary'
                                : 'border-slate-200 bg-white text-slate-400'
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={isCompleted ? faCheckCircle : status.icon}
                            className="h-4 w-4"
                          />
                        </span>

                        <div className="mt-4 w-full max-w-[148px] rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                          <p className={`text-xs ${hasActivity || isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>
                            {status.label}
                          </p>
                          <p className="mt-1 min-h-8 text-[10px] leading-snug text-slate-500">
                            {hoveredStatus === (status.key as string)
                              ? (
                                activity as OrderActivity & {
                                  description?: string;
                                  notes?: string;
                                }
                              )?.description || (
                                activity as OrderActivity & {
                                  description?: string;
                                  notes?: string;
                                }
                              )?.notes || status.description
                              : status.description}
                          </p>

                          {isCurrent && (
                            <span className="mt-2 inline-flex rounded-md border border-primary/15 bg-primary/5 px-2 py-1 text-[10px] uppercase tracking-wide text-primary">
                              Current
                            </span>
                          )}

                          {activity?.createdAt && (
                            <time
                              className={`mt-2 block text-[10px] ${hasActivity || isCurrent ? 'text-slate-700' : 'text-slate-400'}`}
                              title={formatTimestamp(activity.createdAt)}
                            >
                              {formatTimestamp(activity.createdAt)}
                            </time>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            </nav>
          </article>

          {/* Footer actions */}
          <footer className="pot-reveal rounded-xl border border-slate-200 p-5 sm:p-6">
            <p className="mb-4 text-xs uppercase tracking-widest text-slate-600">Continue</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                route="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(-1);
                }}
              >
                Back
              </Button>
              {pathname.includes(`/p/orders/${id}/tracking`) && (
                <Button route="/dashboard" primary className="cursor-pointer">
                  Continue to Dashboard
                </Button>
              )}
            </div>
          </footer>
        </section>
      </main>
    </>
  );
};

export default PublicOrderTracking;
