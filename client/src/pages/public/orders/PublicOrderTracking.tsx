import { useFetchOrderActivities } from '@/hooks/orders/orderActivities.hooks';
import { useAppSelector } from '@/states/hooks';
import type { UUID } from '@/types';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { OrderStatus } from '@/types/order.type';
import { useGetOrder } from '@/hooks/orders/orders.hooks';
import { faCopy, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { OrderActivity } from '@/types/orderActivity.type';
import OrderDetails from '@/containers/orders/OrderDetails';
import { toast } from 'sonner';
import { workflowStatuses } from '@/constants/order.constants';
import Button from '@/components/inputs/Button';

const PublicOrderTracking = () => {
  // STATE VARIABLES
  const { orderActivitiesList } = useAppSelector(
    (state) => state.orderActivity
  );
  const { order } = useAppSelector((state) => state.order);
  const [currentStatus, setCurrentStatus] = useState<OrderActivity | undefined>(
    undefined
  );
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // NAVIGATION
  const { id } = useParams();

  // ORDER ACTIVITY HOOKS
  const { fetchOrderActivities } = useFetchOrderActivities();

  // ORDER HOOKS
  const { getOrder } = useGetOrder();

  useEffect(() => {
    if (id) {
      getOrder({ id: id as UUID });
    }
  }, [id, getOrder]);

  useEffect(() => {
    if (order?.id) {
      fetchOrderActivities({
        orderId: order?.id,
      });
    }
  }, [fetchOrderActivities, order?.id]);

  useEffect(() => {
    if (orderActivitiesList?.[0]) {
      setCurrentStatus(orderActivitiesList?.[0]);
    }
  }, [orderActivitiesList]);

  // Determine current step index
  const currentStepIndex = workflowStatuses.findIndex(
    (status) => status.key === currentStatus?.status
  );

  // Create a map of status to activity for easy lookup
  const statusActivityMap = new Map<OrderStatus, OrderActivity>();
  orderActivitiesList?.forEach((activity) => {
    if (!statusActivityMap.has(activity.status)) {
      statusActivityMap.set(activity.status, activity);
    }
  });

  // Find the furthest status index that has an activity (for progress bar)
  const furthestActivityIndex = workflowStatuses.reduce(
    (maxIndex, status, index) => {
      return statusActivityMap.has(status.key)
        ? Math.max(maxIndex, index)
        : maxIndex;
    },
    -1
  );

  // Helper function to format timestamp
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
    } else {
      return activityDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
  };

  return (
    <main className="py-4 sm:py-6 lg:py-8 px-2 sm:px-4">
      <section className="max-w-7xl mx-auto">
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl uppercase sm:text-xl lg:text-2xl font-bold text-primary mb-2 px-2">
            Track Your Order
          </h1>
          {order && (
            <p className="text-xs sm:text-sm text-gray-600 px-2">
              Order Reference:{' '}
              <span className="break-all font-bold">{order.referenceId}</span>{' '}
              <FontAwesomeIcon
                icon={isCopied ? faCheckCircle : faCopy}
                className="w-4 h-4 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  navigator.clipboard.writeText(order.referenceId);
                  toast.success('Reference ID copied to clipboard');
                  setIsCopied(true);
                  setTimeout(() => {
                    setIsCopied(false);
                  }, 2000);
                }}
              />
            </p>
          )}
        </header>

        {/* Order Details Section */}
        {order && (
          <article className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-sm sm:text-md text-center uppercase font-semibold text-primary mb-3 sm:mb-4">
              Order Details
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <OrderDetails order={order} />
            </dl>
          </article>
        )}

        {/* Horizontal Timeline */}
        <article className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-sm sm:text-md text-center uppercase font-semibold text-gray-800 mb-4 sm:mb-6 lg:mb-8">
            Order Progress
          </h2>

          <nav className="relative">
            {/* Mobile/Small Screen Vertical Layout */}
            <ol className="block sm:hidden space-y-4">
              {/* Vertical Progress Line Background */}
              <span
                className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"
                aria-hidden="true"
              />

              {/* Vertical Progress Line Fill */}
              <span
                className="absolute left-6 top-0 w-0.5 bg-primary transition-all duration-500 ease-in-out"
                style={{
                  height:
                    furthestActivityIndex >= 0
                      ? `${
                          ((furthestActivityIndex + 1) /
                            workflowStatuses.length) *
                          100
                        }%`
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
                    className="flex items-center relative group"
                  >
                    {/* Status Circle */}
                    <button
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-lg transition-all duration-300 z-10 ${
                        isCompleted
                          ? 'bg-slate-600 text-white'
                          : isCurrent
                          ? 'bg-primary text-white ring-4 ring-primary-100'
                          : hasActivity
                          ? 'bg-slate-200 text-white'
                          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                      }`}
                      onMouseEnter={() =>
                        setHoveredStatus(status.key as string)
                      }
                      onMouseLeave={() => setHoveredStatus(null)}
                      aria-label={`${status.label}: ${status.description}`}
                    >
                      {isCompleted ? (
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="w-5 h-5"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={status.icon}
                          className="w-5 h-5"
                        />
                      )}
                    </button>

                    {/* Status Label and Info (Right Side) */}
                    <section className="ml-4 flex-1">
                      <header className="flex items-center justify-between">
                        <hgroup>
                          <p
                            className={`text-[13px] font-medium ${
                              isCurrent
                                ? 'text-primary'
                                : isCompleted || hasActivity
                                ? 'text-primary'
                                : 'text-gray-500'
                            }`}
                          >
                            {status.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {status.description}
                          </p>
                        </hgroup>

                        <aside className="text-right">
                          {isCurrent && (
                            <mark className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white mb-1">
                              Current
                            </mark>
                          )}
                          {activity?.createdAt && (
                            <time
                              className={`block text-xs ${
                                isCurrent
                                  ? 'text-primary'
                                  : isCompleted || hasActivity
                                  ? 'text-primary'
                                  : 'text-gray-400'
                              }`}
                            >
                              {formatTimestamp(activity.createdAt)}
                            </time>
                          )}
                        </aside>
                      </header>
                    </section>

                    {/* Tooltip for Mobile */}
                    {hoveredStatus === (status.key as string) && (
                      <output className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-[11px] rounded-lg shadow-lg whitespace-nowrap z-20 max-w-48">
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
                        <span className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
                      </output>
                    )}
                  </li>
                );
              })}
            </ol>

            {/* Desktop/Tablet Horizontal Layout */}
            <section className="hidden sm:block overflow-x-auto">
              {/* Horizontal Progress Line Background */}
              <span
                className="absolute top-4 sm:top-5 lg:top-6 left-3 sm:left-4 lg:left-6 right-3 sm:right-4 lg:right-6 h-0.5 bg-gray-200"
                aria-hidden="true"
              />

              {/* Horizontal Progress Line Fill */}
              <span
                className="absolute top-4 sm:top-5 lg:top-6 h-0.5 bg-primary transition-all duration-500 ease-in-out"
                style={{
                  left: '0.75rem',
                  right:
                    furthestActivityIndex >= 0
                      ? `calc(${
                          ((workflowStatuses.length -
                            1 -
                            furthestActivityIndex) /
                            (workflowStatuses.length - 1)) *
                          100
                        }% * (100% - 1.5rem) / 100% + 0.75rem)`
                      : 'calc(100% - 0.75rem)',
                }}
                aria-label="Order progress"
              />

              {/* Horizontal Status Steps */}
              <ol className="flex justify-between relative min-w-max sm:min-w-0 gap-2 sm:gap-0">
                {workflowStatuses.map((status, index) => {
                  const hasActivity = statusActivityMap.has(status.key);
                  const isCurrent = index === currentStepIndex;
                  const isCompleted = hasActivity && index < currentStepIndex;
                  const activity = statusActivityMap.get(status.key);

                  return (
                    <li
                      key={status.key}
                      className="flex flex-col items-center relative group min-w-0 flex-1 sm:flex-initial"
                    >
                      {/* Status Circle */}
                      <button
                        className={`relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-2 sm:border-3 lg:border-4 border-white shadow-lg transition-all duration-300 ${
                          isCompleted
                            ? 'bg-slate-600 text-white'
                            : isCurrent
                            ? 'bg-primary text-white ring-2 sm:ring-3 lg:ring-4 ring-primary-100'
                            : hasActivity
                            ? 'bg-slate-200 text-white'
                            : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                        }`}
                        onMouseEnter={() =>
                          setHoveredStatus(status.key as string)
                        }
                        onMouseLeave={() => setHoveredStatus(null)}
                        aria-label={`${status.label}: ${status.description}`}
                      >
                        {isCompleted ? (
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={status.icon}
                            className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                          />
                        )}
                      </button>

                      {/* Tooltip */}
                      {hoveredStatus === (status.key as string) && (
                        <output className="absolute bottom-full mb-2 px-2 sm:px-3 py-1 sm:py-2 bg-gray-900 text-white text-[10px] sm:text-[11px] rounded-lg shadow-lg whitespace-nowrap z-10 max-w-32 sm:max-w-48">
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
                          <span className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                        </output>
                      )}

                      {/* Status Label */}
                      <footer className="mt-2 sm:mt-3 text-center min-w-0">
                        <p
                          className={`text-xs sm:text-sm font-medium truncate px-1 ${
                            isCurrent
                              ? 'text-primary'
                              : isCompleted || hasActivity
                              ? 'text-primary-500'
                              : 'text-gray-500'
                          }`}
                          title={status.label}
                        >
                          {status.label}
                        </p>
                        {isCurrent && (
                          <mark className="mt-1 inline-flex items-center px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-primary text-white">
                            Current
                          </mark>
                        )}

                        {/* Timestamp for all statuses with activities */}
                        {activity?.createdAt && (
                          <time
                            className={`block text-[10px] sm:text-xs mt-1 truncate ${
                              isCurrent
                                ? 'text-primary'
                                : isCompleted || hasActivity
                                ? 'text-primary'
                                : 'text-gray-400'
                            }`}
                            title={formatTimestamp(activity.createdAt)}
                          >
                            {formatTimestamp(activity.createdAt)}
                          </time>
                        )}
                      </footer>
                    </li>
                  );
                })}
              </ol>
            </section>
          </nav>
        </article>
      </section>
      <menu className='flex items-center justify-between max-w-7xl mx-auto'>
        <Button route={`/p/orders/${order?.id}`}>
          Back
        </Button>
      </menu>
    </main>
  );
};

export default PublicOrderTracking;
