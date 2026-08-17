import { useFetchPublicOrderActivities } from '@/hooks/orders/orderActivities.hooks';
import { useAppSelector } from '@/states/hooks';
import type { UUID } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { OrderStatus } from '@/types/order.type';
import { useGetPublicOrder } from '@/hooks/orders/orders.hooks';
import { faCopy, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type OrderActivity } from '@/types/orderActivity.type';
import { toast } from 'sonner';
import {
  getWorkflowStatusForActivity,
  workflowStatuses,
} from '@/constants/order.constants';
import Button from '@/components/inputs/Button';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  faClockRotateLeft,
  faHashtag,
  faKey,
  faPhone,
  faTruckFast,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import {
  OrderStageRail,
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

  const statusActivityMap = useMemo(() => {
    const map = new Map<OrderStatus, OrderActivity>();
    orderActivitiesList?.forEach((activity) => {
      const workflowStatus = getWorkflowStatusForActivity(activity.status);
      if (workflowStatus && !map.has(workflowStatus)) {
        map.set(workflowStatus, activity);
      }
    });
    return map;
  }, [orderActivitiesList]);

  const currentWorkflowActivity = useMemo(
    () =>
      orderActivitiesList?.find((activity) =>
        Boolean(getWorkflowStatusForActivity(activity.status)),
      ),
    [orderActivitiesList],
  );

  const currentWorkflowStatus =
    getWorkflowStatusForActivity(currentWorkflowActivity?.status) ||
    getWorkflowStatusForActivity(order?.status) ||
    undefined;

  const currentStepIndex = workflowStatuses.findIndex(
    (status) => status.key === currentWorkflowStatus,
  );

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

  const senderName = order?.sender?.name || order?.senderName || '—';
  const senderPhone =
    order?.sender?.phoneNumber || order?.senderPhoneNumber || '—';
  const recipientName = order?.recipient?.name || order?.recipientName || '—';
  const recipientPhone =
    order?.recipient?.phoneNumber || order?.recipientPhoneNumber || '—';

  return (
    <PublicPage>
      <PublicPageHero
        eyebrow="Tracking"
        title={order?.referenceId || 'Follow your delivery'}
        description="See the latest delivery status, route milestones, and contact details in one place."
        actions={
          order?.referenceId ? (
            <div className="flex flex-wrap items-center gap-2">
              <code className="font-['IBM_Plex_Mono'] text-xs text-[var(--peekaboo-text)]">
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
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--peekaboo-line)] bg-white text-[var(--peekaboo-muted)] hover:border-[var(--peekaboo-dark)] hover:text-[var(--peekaboo-dark)]"
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

      <OrderStageRail currentStage="tracking" />

      <PublicSectionCard
        eyebrow="Progress"
        title="Order progress"
        description="Completed milestones and the step currently in progress."
      >
        <nav className="relative">
          <ol className="space-y-4 sm:hidden">
            <span
              className="absolute bottom-0 left-5 top-0 w-px bg-[var(--peekaboo-line)]"
              aria-hidden="true"
            />
            <span
              className="absolute left-5 top-0 w-px bg-[var(--peekaboo-yellow)] transition-all duration-700 motion-reduce:transition-none"
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
                >
                  <span
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm transition-colors ${
                      isCompleted || isCurrent
                        ? 'border-[var(--peekaboo-dark)] bg-[var(--peekaboo-dark)] text-white'
                        : hasActivity
                          ? 'border-[var(--peekaboo-yellow)] bg-white text-[var(--peekaboo-dark)]'
                          : 'border-[var(--peekaboo-line)] bg-white text-[var(--peekaboo-muted)]'
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={isCompleted ? faCheckCircle : status.icon}
                      className="h-4 w-4"
                    />
                  </span>

                  <section className="min-w-0 flex-1 border-b border-[var(--peekaboo-line)] pb-4">
                    <header className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${hasActivity || isCurrent ? 'text-[var(--peekaboo-dark)]' : 'text-[var(--peekaboo-muted)]'}`}>
                          {status.label}
                        </p>
                        <p className="mt-1 text-xs text-[var(--peekaboo-muted)]">{status.description}</p>
                      </div>
                      <aside className="shrink-0 text-right">
                        {isCurrent ? (
                          <span className="inline-flex border-l-2 border-[var(--peekaboo-yellow)] px-2 py-0.5 font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-[0.08em] text-[var(--peekaboo-dark)]">
                            Current
                          </span>
                        ) : null}
                        {activity?.createdAt ? (
                          <time
                            className={`mt-1 block font-['IBM_Plex_Mono'] text-[9px] ${hasActivity || isCurrent ? 'text-[var(--peekaboo-text)]' : 'text-[var(--peekaboo-muted)]'}`}
                          >
                            {formatTimestamp(activity.createdAt)}
                          </time>
                        ) : null}
                      </aside>
                    </header>

                  </section>
                </li>
              );
            })}
          </ol>

          <section className="hidden overflow-x-auto pb-2 sm:block">
            <span
              className="absolute left-6 right-6 top-5 h-px bg-[var(--peekaboo-line)]"
              aria-hidden="true"
            />
            <span
              className="absolute top-5 h-px bg-[var(--peekaboo-yellow)] transition-all duration-700 motion-reduce:transition-none"
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
                  >
                    <span
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm transition-colors ${
                        isCompleted || isCurrent
                          ? 'border-[var(--peekaboo-dark)] bg-[var(--peekaboo-dark)] text-white'
                          : hasActivity
                            ? 'border-[var(--peekaboo-yellow)] bg-white text-[var(--peekaboo-dark)]'
                            : 'border-[var(--peekaboo-line)] bg-white text-[var(--peekaboo-muted)]'
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={isCompleted ? faCheckCircle : status.icon}
                        className="h-4 w-4"
                      />
                    </span>

                    <div className="mt-4 w-full max-w-[150px] border-t border-[var(--peekaboo-line)] pt-3 text-center">
                      <p className={`text-xs font-medium ${hasActivity || isCurrent ? 'text-[var(--peekaboo-dark)]' : 'text-[var(--peekaboo-muted)]'}`}>
                        {status.label}
                      </p>
                      <p className="mt-1 min-h-8 text-[10px] leading-snug text-[var(--peekaboo-muted)]">
                        {status.description}
                      </p>

                      {isCurrent ? (
                        <span className="mt-2 inline-flex border-l-2 border-[var(--peekaboo-yellow)] px-2 py-0.5 font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-[0.08em] text-[var(--peekaboo-dark)]">
                          Current
                        </span>
                      ) : null}

                      {activity?.createdAt ? (
                        <time
                          className={`mt-2 block font-['IBM_Plex_Mono'] text-[9px] ${hasActivity || isCurrent ? 'text-[var(--peekaboo-text)]' : 'text-[var(--peekaboo-muted)]'}`}
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
        eyebrow="Order info"
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
              className="border-l-2 border-[var(--peekaboo-yellow)] py-1 pl-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--peekaboo-gray)] text-[var(--peekaboo-dark)]">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <div className="min-w-0">
                  <p className="font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-[0.08em] text-[var(--peekaboo-muted)]">
                    {item.label}
                  </p>
                  <p className="mt-1 break-all font-['IBM_Plex_Mono'] text-xs text-[var(--peekaboo-dark)]">
                    {orderLoading ? 'Loading…' : item.value}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </PublicSectionCard>

      <PublicSectionCard
        eyebrow="Contacts"
        title="Sender and receiver"
        description="Account details when available."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            {
              title: 'Sender',
              name: senderName,
              phone: senderPhone,
            },
            {
              title: 'Receiver',
              name: recipientName,
              phone: recipientPhone,
            },
          ].map((contact) => (
            <article
              key={contact.title}
              className="border-l-2 border-[var(--peekaboo-yellow)] py-1 pl-4"
            >
              <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.08em] text-[var(--peekaboo-muted)]">
                {contact.title}
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[var(--peekaboo-text)]">
                  <FontAwesomeIcon icon={faUser} className="h-3.5 w-3.5 text-[var(--peekaboo-muted)]" />
                  <span>{orderLoading ? 'Loading…' : contact.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--peekaboo-text)]">
                  <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5 text-[var(--peekaboo-muted)]" />
                  <span>{orderLoading ? 'Loading…' : contact.phone}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </PublicSectionCard>

        <footer className="mt-1 flex items-center justify-between gap-3">
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
              Continue to dashboard
            </Button>
          ) : null}
        </footer>
    </PublicPage>
  );
};

export default PublicOrderTracking;
