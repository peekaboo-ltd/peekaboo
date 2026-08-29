import { useFetchPublicOrderActivities } from '@/hooks/orders/orderActivities.hooks';
import { useAppSelector } from '@/states/hooks';
import type { UUID } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { OrderStatus, PREFERRED_CONTACT_METHOD_LABELS } from '@/types/order.type';
import { useGetPublicOrder } from '@/hooks/orders/orders.hooks';
import { faCopy, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type OrderActivity } from '@/types/orderActivity.type';
import { toast } from 'sonner';
import StepTrail, { type TrailStep } from '@/components/orders/StepTrail';
import RouteSummary from '@/components/orders/RouteSummary';
import RouteCalculator from '@/containers/locations/RouteCalculator';
import Modal from '@/components/Modal';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getWorkflowStatusForActivity,
  workflowStatuses,
} from '@/constants/order.constants';
import Button from '@/components/inputs/Button';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { faPhone, faUser } from '@fortawesome/free-solid-svg-icons';
import { PublicPage } from '@/components/layout/PublicPage';
import OrderSetupHeroMap from './components/OrderSetupHeroMap';

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
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  // Tracking never computed a route, so it had no distance or ETA to show.
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

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
      fetchPublicOrderActivities({ orderId: order.id });
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

  /** Every milestone, shared by the collapsed view and the full-trail modal. */
  const steps: TrailStep[] = useMemo(
    () =>
      workflowStatuses.map((status, index) => {
        const activity = statusActivityMap.get(status.key);
        return {
          key: status.key,
          label: status.label,
          description: status.description,
          icon: status.icon,
          timestamp: activity?.createdAt
            ? formatTimestamp(activity.createdAt)
            : undefined,
          state:
            index === currentStepIndex
              ? 'current'
              : statusActivityMap.has(status.key) && index < currentStepIndex
                ? 'done'
                : 'upcoming',
        };
      }),
    [statusActivityMap, currentStepIndex],
  );

  // The page answers one question — where is it now? Seven milestones is the
  // full record, but six of them are inert at any moment, so the collapsed view
  // shows the step either side and the rest is one click away.
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const currentStep = steps[activeIndex];
  const previousStep = activeIndex > 0 ? steps[activeIndex - 1] : undefined;
  const nextStep =
    activeIndex < steps.length - 1 ? steps[activeIndex + 1] : undefined;

  const contacts = [
    {
      title: 'Sender',
      name: order?.sender?.name || order?.senderName || '—',
      phone: order?.sender?.phoneNumber || order?.senderPhoneNumber || '—',
    },
    {
      title: 'Receiver',
      name: order?.recipient?.name || order?.recipientName || '—',
      phone: order?.recipient?.phoneNumber || order?.recipientPhoneNumber || '—',
    },
  ];

  const contactMethodLabel = order?.preferredContactMethod
    ? PREFERRED_CONTACT_METHOD_LABELS[order.preferredContactMethod]
    : undefined;

  const hasRoute = Boolean(order?.locationFrom && order?.locationTo);

  return (
    <PublicPage viewport>
      {hasRoute ? (
        <RouteCalculator
          locationFrom={{
            latitude: order?.locationFrom?.latitude ?? 0,
            longitude: order?.locationFrom?.longitude ?? 0,
          }}
          locationTo={{
            latitude: order?.locationTo?.latitude ?? 0,
            longitude: order?.locationTo?.longitude ?? 0,
          }}
          onRouteCalculated={(calculatedDistance, calculatedTime) => {
            setDistance(calculatedDistance);
            setEstimatedTime(calculatedTime);
          }}
        />
      ) : null}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <hgroup className="min-w-0">
          <p className="type-eyebrow">Tracking</p>
          <h1 className="type-page-title truncate">
            {order?.referenceId || 'Follow your delivery'}
          </h1>
        </hgroup>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="type-meta cursor-pointer text-(--ink) underline underline-offset-2"
          >
            Order details
          </button>
          {order?.referenceId ? (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(order.referenceId);
                toast.success('Reference ID copied to clipboard');
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }}
              className={cn(
                buttonVariants({ variant: 'field', size: 'icon-sm' }),
                'justify-center',
              )}
              aria-label="Copy reference ID"
            >
              <FontAwesomeIcon
                icon={isCopied ? faCheckCircle : faCopy}
                className="size-3.5"
              />
            </button>
          ) : null}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-8">
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto lg:pr-1">
          {/* The answer, stated once and large. */}
          <section className="card-framed p-5" aria-live="polite">
            <p className="type-eyebrow">Right now</p>
            <h2 className="type-h3 mt-1">
              {orderLoading ? 'Loading…' : (currentStep?.label ?? '—')}
            </h2>
            <p className="type-meta mt-1">
              {currentStep?.description ?? 'Waiting for the first update.'}
            </p>
            <p className="type-meta mt-3 tabular">
              Updated{' '}
              {formatTimestamp(currentStatus?.createdAt || order?.updatedAt)}
            </p>
          </section>

          {hasRoute ? (
            <RouteSummary
              distance={distance}
              estimatedTime={estimatedTime}
              fee={order?.finalFee ?? order?.initialFee}
              feeLabel="Total"
            />
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <p className="type-meta min-w-0 truncate">
              {previousStep ? `Before: ${previousStep.label}` : 'This is the first step'}
              {nextStep ? ` · Next: ${nextStep.label}` : ' · Final step'}
            </p>
            <button
              type="button"
              onClick={() => setShowAllSteps(true)}
              className="type-meta shrink-0 cursor-pointer text-(--ink) underline underline-offset-2"
            >
              All {steps.length} steps
            </button>
          </div>

          <section className="grid gap-3 sm:grid-cols-2">
            {contacts.map((contact) => (
              <article key={contact.title} className="card-quiet p-4">
                <p className="type-eyebrow">{contact.title}</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-(--ink)">
                  <FontAwesomeIcon icon={faUser} className="size-3.5 text-(--muted)" />
                  <span className="truncate">
                    {orderLoading ? 'Loading…' : contact.name}
                  </span>
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-(--ink)">
                  <FontAwesomeIcon icon={faPhone} className="size-3.5 text-(--muted)" />
                  <span className="truncate tabular">
                    {orderLoading ? 'Loading…' : contact.phone}
                  </span>
                </p>
              </article>
            ))}
          </section>

          {contactMethodLabel ? (
            <p className="type-meta">
              Updates go to the sender by {contactMethodLabel}.
            </p>
          ) : null}

          <footer className="mt-auto flex items-center justify-between gap-3 pt-1">
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
              <Button route="/dashboard" variant="primary">
                Continue to dashboard
              </Button>
            ) : null}
          </footer>
        </div>

        <div className="min-h-0 max-lg:hidden">
          <OrderSetupHeroMap
            pickup={order?.locationFrom}
            dropoff={order?.locationTo}
            className="h-full"
          />
        </div>
      </div>

      <Modal
        isOpen={showAllSteps}
        onClose={() => setShowAllSteps(false)}
        heading="Delivery milestones"
        description="Every step of this delivery, and when it happened."
      >
        <StepTrail label="Order progress" steps={steps} />
      </Modal>

      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        heading="Order details"
        description="Reference codes for this delivery."
      >
        <dl className="divide-y divide-(--line) text-sm">
          {[
            { label: 'Order reference', value: order?.referenceId },
            { label: 'Tracking code', value: order?.trackingId },
            { label: 'Last activity', value: currentStatus?.status || order?.status },
            { label: 'Preferred contact', value: contactMethodLabel },
          ].map((item) => (
            <div key={item.label} className="flex justify-between gap-4 py-3 first:pt-0">
              <dt className="type-meta">{item.label}</dt>
              <dd className="min-w-0 break-all text-right text-sm text-(--ink)">
                {item.value || '—'}
              </dd>
            </div>
          ))}
        </dl>
      </Modal>
    </PublicPage>
  );
};

export default PublicOrderTracking;
