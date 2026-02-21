import { useFetchOrderActivities } from '@/hooks/orders/orderActivities.hooks';
import { useAppSelector } from '@/states/hooks';
import type { UUID } from '@/types';
import { useEffect, useState } from 'react';
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
import { motion, Variants } from 'framer-motion';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';

const PublicOrderTracking = () => {
  useDocumentTitle('Order Tracking');
  // STATE VARIABLES
  const { orderActivitiesList } = useAppSelector(
    (state) => state.orderActivity,
  );
  const { order } = useAppSelector((state) => state.order);
  const [currentStatus, setCurrentStatus] = useState<OrderActivity | undefined>(
    undefined,
  );
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // NAVIGATION
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
    (status) => status.key === currentStatus?.status,
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
    -1,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.main
      className="min-h-screen bg-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <section className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.header
          className="text-center mb-8 sm:mb-10"
          variants={itemVariants as unknown as Variants}
        >
          <mark className="inline-flex items-center justify-center w-16 h-16 bg-transparent rounded-2xl mb-4">
            <img
              src="/peekaboo.png"
              alt="Peekaboo"
              className="w-24 h-24 object-contain"
            />
          </mark>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Track Your Order
          </h1>
          {order && (
            <section className="flex items-center justify-center gap-2 text-gray-600">
              <span className="text-sm">Order Reference:</span>
              <code className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-mono font-semibold text-black">
                {order?.referenceId}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(order.referenceId);
                  toast.success('Reference ID copied to clipboard');
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Copy reference ID"
              >
                <FontAwesomeIcon
                  icon={isCopied ? faCheckCircle : faCopy}
                  className={`w-4 h-4 ${isCopied ? 'text-black' : 'text-gray-400'}`}
                />
              </button>
            </section>
          )}
        </motion.header>

        {/* Order Details Section */}
        {order && (
          <motion.article
            className="bg-white rounded-2xl shadow-lg shadow-gray-900/5 border border-gray-100 p-6 sm:p-8 mb-6"
            variants={itemVariants as unknown as Variants}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary-600 rounded-full"></span>
              Order Details
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              <OrderDetails order={order} />
            </dl>
          </motion.article>
        )}

        {/* Order Progress Timeline */}
        <motion.article
          className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6"
          variants={itemVariants as unknown as Variants}
        >
          <h2 className="text-lg font-normal text-gray-900 mb-8 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary-600 rounded-full"></span>
            Order Progress
          </h2>

          <nav className="relative">
            {/* Mobile/Small Screen Vertical Layout */}
            <ol className="block sm:hidden space-y-6">
              {/* Vertical Progress Line Background */}
              <span
                className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 rounded-full"
                aria-hidden="true"
              />

              {/* Vertical Progress Line Fill */}
              <motion.span
                className="absolute left-6 top-0 w-0.5 bg-primary-600 rounded-full"
                initial={{ height: 0 }}
                animate={{
                  height:
                    furthestActivityIndex >= 0
                      ? `${((furthestActivityIndex + 1) / workflowStatuses.length) * 100}%`
                      : '0%',
                }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                aria-label="Order progress"
              />

              {workflowStatuses.map((status, index) => {
                const hasActivity = statusActivityMap.has(status.key);
                const isCurrent = index === currentStepIndex;
                const isCompleted = hasActivity && index < currentStepIndex;
                const activity = statusActivityMap.get(status.key);

                return (
                  <motion.li
                    key={status.key}
                    className="flex items-start relative group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onMouseEnter={() => setHoveredStatus(status.key as string)}
                    onMouseLeave={() => setHoveredStatus(null)}
                  >
                    {/* Status Circle */}
                    <button
                      className={`relative flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-300 z-10 cursor-pointer ${isCompleted
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : isCurrent
                          ? 'bg-primary-600 border-primary-600 text-white ring-4 ring-primary-100'
                          : hasActivity
                            ? 'bg-primary-100 border-primary-200 text-black'
                            : 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200'
                        }`}
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

                    {/* Status Label and Info */}
                    <section className="ml-4 flex-1 min-w-0">
                      <header className="flex items-start justify-between gap-2">
                        <hgroup className="min-w-0">
                          <p
                            className={`text-sm font-normal truncate ${isCurrent || isCompleted || hasActivity
                              ? 'text-gray-900'
                              : 'text-gray-500'
                              }`}
                          >
                            {status.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {status.description}
                          </p>
                        </hgroup>

                        <aside className="flex-shrink-0 text-right">
                          {isCurrent && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-normal bg-primary-100 text-black">
                              Current
                            </span>
                          )}
                          {activity?.createdAt && (
                            <time
                              className={`block text-xs mt-1 ${isCurrent || isCompleted || hasActivity
                                ? 'text-black font-normal'
                                : 'text-gray-400'
                                }`}
                            >
                              {formatTimestamp(activity.createdAt)}
                            </time>
                          )}
                        </aside>
                      </header>
                    </section>

                    {/* Tooltip */}
                    {hoveredStatus === (status.key as string) && (
                      <output className="absolute left-full ml-4 top-0 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50 max-w-48">
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
                        <span className="absolute right-full top-3 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
                      </output>
                    )}
                  </motion.li>
                );
              })}
            </ol>

            {/* Desktop/Tablet Horizontal Layout */}
            <section className="hidden sm:block overflow-x-auto pb-4">
              {/* Horizontal Progress Line Background */}
              <span
                className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 rounded-full"
                aria-hidden="true"
              />

              {/* Horizontal Progress Line Fill */}
              <motion.span
                className="absolute top-6 h-0.5 bg-primary-600 rounded-full"
                style={{ left: '1.5rem' }}
                initial={{ width: 0 }}
                animate={{
                  width:
                    furthestActivityIndex >= 0
                      ? `calc(${(furthestActivityIndex / (workflowStatuses.length - 1)) * 100}% - 3rem)`
                      : '0%',
                }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                aria-label="Order progress"
              />

              {/* Horizontal Status Steps */}
              <ol className="flex justify-between relative">
                {workflowStatuses.map((status, index) => {
                  const hasActivity = statusActivityMap.has(status.key);
                  const isCurrent = index === currentStepIndex;
                  const isCompleted = hasActivity && index < currentStepIndex;
                  const activity = statusActivityMap.get(status.key);

                  return (
                    <motion.li
                      key={status.key}
                      className="flex flex-col items-center relative group flex-1 mt-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onMouseEnter={() =>
                        setHoveredStatus(status.key as string)
                      }
                      onMouseLeave={() => setHoveredStatus(null)}
                    >
                      {/* Status Circle */}
                      <button
                        className={`relative flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-300 cursor-pointer ${isCompleted
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : isCurrent
                            ? 'bg-primary-600 border-primary-600 text-white ring-4 ring-primary-100'
                            : hasActivity
                              ? 'bg-primary-100 border-primary-200 text-black'
                              : 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200'
                          }`}
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

                      {/* Status Label */}
                      <footer className="mt-4 text-center max-w-[120px]">
                        <p
                          className={`text-xs font-normal truncate ${isCurrent || isCompleted || hasActivity
                            ? 'text-gray-900'
                            : 'text-gray-500'
                            }`}
                          title={status.label}
                        >
                          {status.label}
                        </p>

                        <p
                          className={`mt-1 text-[10px] leading-snug text-gray-500 transition-opacity duration-200 ${hoveredStatus === (status.key as string)
                            ? 'opacity-100'
                            : 'opacity-0'
                            }`}
                        >
                          {(
                            activity as OrderActivity & {
                              notes?: string;
                              description?: string;
                            }
                          )?.description || status.description}
                        </p>

                        {isCurrent && (
                          <span className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-normal bg-primary-100 text-black">
                            Current
                          </span>
                        )}

                        {activity?.createdAt && (
                          <time
                            className={`block text-[10px] mt-1 ${isCurrent || isCompleted || hasActivity
                              ? 'text-black font-normal'
                              : 'text-gray-400'
                              }`}
                            title={formatTimestamp(activity.createdAt)}
                          >
                            {formatTimestamp(activity.createdAt)}
                          </time>
                        )}
                      </footer>
                    </motion.li>
                  );
                })}
              </ol>
            </section>
          </nav>
        </motion.article>

        {/* Action Buttons */}
        <motion.footer
          className="flex items-center justify-between gap-4"
          variants={itemVariants as unknown as Variants}
        >
          <Button
            route={`#`}
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
          >
            Back
          </Button>
          {pathname.includes(`/p/orders/${id}/tracking`) && <Button route="/dashboard" primary className="cursor-pointer">
            Continue to Dashboard
          </Button>}
        </motion.footer>
      </section>
    </motion.main>
  );
};

export default PublicOrderTracking;
