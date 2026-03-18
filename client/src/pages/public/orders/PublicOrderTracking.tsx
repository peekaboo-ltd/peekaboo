import { useFetchPublicOrderActivities } from '@/hooks/orders/orderActivities.hooks';
import { useAppSelector } from '@/states/hooks';
import type { UUID } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { OrderStatus } from '@/types/order.type';
import { useGetPublicOrder } from '@/hooks/orders/orders.hooks';
import { faCopy, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { OrderActivity } from '@/types/orderActivity.type';
import { toast } from 'sonner';
import { workflowStatuses } from '@/constants/order.constants';
import Button from '@/components/inputs/Button';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  faClockRotateLeft,
  faHashtag,
  faKey,
  faTruckFast,
} from '@fortawesome/free-solid-svg-icons';
import {
  PublicPage,
  PublicPageHero,
  PublicSectionCard,
  PublicStatCard,
} from '@/components/layout/PublicPage';

const formatTimestamp = (date?: Date | string) => {
  if (!date) return '—';
  const activityDate = new Date(date);
  if (Number.isNaN(activityDate.getTime())) return '—';

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

const PublicOrderTracking = () => {
  useDocumentTitle('Order Tracking');

  const { orderActivitiesList } = useAppSelector((state) => state.orderActivity);
  const { order } = useAppSelector((state) => state.order);
  const [currentStatus, setCurrentStatus] = useState<OrderActivity | undefined>(undefined);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { fetchPublicOrderActivities } = useFetchPublicOrderActivities();
  const { getPublicOrder, isFetching: orderLoading } = useGetPublicOrder();

  useEffect(() => {
    if (id) {
      getPublicOrder({ id: id as UUID });
    }
  }, [id, getPublicOrder]);

  useEffect(() => {
    if (order?.id) {
      fetchPublicOrderActivities({
        orderId: order.id,
      });
    }
  }, [fetchPublicOrderActivities, order?.id]);

  useEffect(() => {
    if (orderActivitiesList?.[0]) {
      setCurrentStatus(orderActivitiesList[0]);
    }
  }, [orderActivitiesList]);

  const currentStepIndex = workflowStatuses.findIndex(
    (status) => status.key === currentStatus?.status,
  );

  const statusActivityMap = useMemo(() => {
    const map = new Map<OrderStatus, OrderActivity>();
    orderActivitiesList?.forEach((activity) => {
      if (!map.has(activity.status)) {
        map.set(activity.status, activity);
      }
    });
    return map;
  }, [orderActivitiesList]);

  const furthestActivityIndex = workflowStatuses.reduce((maxIndex, status, index) => {
    return statusActivityMap.has(status.key) ? Math.max(maxIndex, index) : maxIndex;
  }, -1);

  const stats = [
    {
      label: 'Current Status',
      value: currentStatus?.status || order?.status || '—',
      icon: faTruckFast,
    },
    {
      label: 'Last Update',
      value: formatTimestamp(currentStatus?.createdAt || order?.updatedAt),
      icon: faClockRotateLeft,
    },
  ];

  return (
    <PublicPage>
      <PublicPageHero
        eyebrow="Tracking"
        title={order?.referenceId || 'Follow your delivery'}
        description="Current status and order progress."
        actions={
          order?.referenceId ? (
            <div className="flex flex-wrap items-center gap-2">
              <code className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-normal text-slate-700">
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
                className="cursor-pointer rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition-colors hover:border-primary hover:text-primary"
                aria-label="Copy reference ID"
              >
                <FontAwesomeIcon
                  icon={isCopied ? faCheckCircle : faCopy}
                  className="h-3.5 w-3.5"
                />
              </button>
            </div>
          ) : null
        }
      />

      <PublicSectionCard
        eyebrow="Progress"
        title="Order progress"
        description="Latest movement across the delivery steps."
      >
        <nav className="relative">
          <ol className="space-y-4 sm:hidden">
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

                  <section className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/85 p-4">
                    <header className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-sm ${hasActivity || isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>
                          {status.label}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{status.description}</p>
                      </div>
                      <aside className="shrink-0 text-right">
                        {isCurrent ? (
                          <span className="inline-flex rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[10px] font-normal uppercase tracking-wide text-primary">
                            Current
                          </span>
                        ) : null}
                        {activity?.createdAt ? (
                          <time
                            className={`mt-1 block text-[10px] ${hasActivity || isCurrent ? 'text-slate-700' : 'text-slate-400'}`}
                          >
                            {formatTimestamp(activity.createdAt)}
                          </time>
                        ) : null}
                      </aside>
                    </header>

                    {hoveredStatus === (status.key as string) ? (
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
                    ) : null}
                  </section>
                </li>
              );
            })}
          </ol>

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

                    <div className="mt-4 w-full max-w-[150px] rounded-lg border border-slate-200 bg-slate-50/85 p-3 text-center">
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
                          )?.description ||
                            (
                              activity as OrderActivity & {
                                description?: string;
                                notes?: string;
                              }
                            )?.notes ||
                            status.description
                          : status.description}
                      </p>

                      {isCurrent ? (
                        <span className="mt-2 inline-flex rounded-full border border-primary/15 bg-primary/5 px-2 py-1 text-[10px] font-normal uppercase tracking-wide text-primary">
                          Current
                        </span>
                      ) : null}

                      {activity?.createdAt ? (
                        <time
                          className={`mt-2 block text-[10px] ${hasActivity || isCurrent ? 'text-slate-700' : 'text-slate-400'}`}
                          title={formatTimestamp(activity.createdAt)}
                        >
                          {formatTimestamp(activity.createdAt)}
                        </time>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </nav>
      </PublicSectionCard>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <PublicStatCard
            key={stat.label}
            label={stat.label}
            value={orderLoading ? 'Loading…' : stat.value}
            icon={<FontAwesomeIcon icon={stat.icon} />}
          />
        ))}
      </section>

      <PublicSectionCard
        eyebrow="Order Info"
        title="Reference details"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Order Reference', value: order?.referenceId || '—', icon: faHashtag },
            { label: 'Tracking Code', value: order?.trackingId || '—', icon: faKey },
            {
              label: 'Last Activity',
              value: currentStatus?.status || order?.status || '—',
              icon: faTruckFast,
            },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-lg border border-slate-200 bg-slate-50/85 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-normal uppercase tracking-[0.24em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-1 break-all text-sm font-normal text-slate-900">
                    {orderLoading ? 'Loading…' : item.value}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </PublicSectionCard>

        <footer className="flex items-center gap-3 justify-between mt-5">
          <Button
            route="#"
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
          >
            Back
          </Button>
          {pathname.includes(`/p/orders/${id}/tracking`) ? (
            <Button route="/dashboard" primary>
              Continue to Dashboard
            </Button>
          ) : null}
        </footer>
    </PublicPage>
  );
};

export default PublicOrderTracking;
