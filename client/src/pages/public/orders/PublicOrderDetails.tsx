import { useGetPublicOrder, useGetOrderFees, useUpdatePublicOrder } from '@/hooks/orders/orders.hooks';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  setOrder,
  setOrderPaymentModal,
  setSelectedOrder,
  setUpdateOrderLocationFromModal,
  setUpdateOrderLocationToModal,
} from '@/states/slices/order.slice';
import type { UUID } from '@/types';
import { getCurrentLocation } from '@/utils/locations.util';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import RouteCalculator from '@/containers/locations/RouteCalculator';
import AdministrativeLocation from '@/containers/locations/AdministrativeLocation';
import { useCreatePublicOrderAssignment } from '@/hooks/orders/orderAssignments.hooks';
import Button from '@/components/inputs/Button';
import { formatCurrency } from '@/utils/strings.util';
import UpdateOrderLocationFrom from '@/components/modals/UpdateOrderLocationFrom';
import UpdateOrderLocationTo from '@/components/modals/UpdateOrderLocationTo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import OrderPayment from '@/components/modals/OrderPayment';
import { useFetchPublicPayments } from '@/hooks/payments/payment.hooks';
import { KpayPaymentStatus, PaymentType } from '@/types/payment.types';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  faLocationDot,
  faMoneyBillWave,
  faRoute,
} from '@fortawesome/free-solid-svg-icons';
import {
  PublicPage,
  PublicPageHero,
  PublicSectionCard,
  PublicStatCard,
} from '@/components/layout/PublicPage';

const SkeletonLine = ({ className = '' }: { className?: string }) => (
  <span className={`inline-block animate-pulse rounded bg-slate-100 ${className}`} />
);

const PublicOrderDetails = () => {
  useDocumentTitle('Order Details');

  const dispatch = useAppDispatch();
  const { order } = useAppSelector((state) => state.order);
  const { paymentsList } = useAppSelector((state) => state.payment);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const orderId = id as UUID | undefined;
  const currentOrder = order?.id === orderId ? order : undefined;

  const { fetchPublicPayments } = useFetchPublicPayments();

  useEffect(() => {
    if (currentOrder?.id) {
      fetchPublicPayments({ entityId: currentOrder.id, paymentType: PaymentType.ORDER });
    }
  }, [fetchPublicPayments, currentOrder?.id]);

  const { getPublicOrder } = useGetPublicOrder();
  const { updatePublicOrder } = useUpdatePublicOrder();
  const { getOrderFee, orderFee } = useGetOrderFees(
    currentOrder?.finalFee !== null && currentOrder?.finalFee !== undefined ? currentOrder.finalFee : undefined,
    orderId,
  );

  const {
    createPublicOrderAssignment,
    isSuccess: createOrderAssignmentIsSuccess,
    isLoading: createOrderAssignmentIsLoading,
  } = useCreatePublicOrderAssignment();

  useEffect(() => {
    if (createOrderAssignmentIsSuccess) {
      navigate(`/p/orders/${currentOrder?.id}/tracking`);
    }
  }, [createOrderAssignmentIsSuccess, navigate, currentOrder?.id]);

  const handleGetCurrentLocation = useCallback(async () => {
    if (!currentOrder?.id) return;

    setGettingCurrentLocation(true);
    try {
      const location = await getCurrentLocation();
      updatePublicOrder({
        id: currentOrder.id,
        order: {
          locationFrom: {
            latitude: location?.latitude,
            longitude: location?.longitude,
          },
        },
      });
    } catch (error) {
      console.error('Failed to get current location:', error);
    } finally {
      setGettingCurrentLocation(false);
    }
  }, [currentOrder?.id, updatePublicOrder]);

  useLayoutEffect(() => {
    if (order?.id !== orderId) {
      dispatch(setOrder(undefined));
      setDistance(null);
      setEstimatedTime(null);
    }
  }, [dispatch, order?.id, orderId]);

  useEffect(() => {
    if (orderId) {
      getPublicOrder({ id: orderId });
    }
  }, [orderId, getPublicOrder]);

  useEffect(() => {
    return () => {
      setDistance(null);
      setEstimatedTime(null);
    };
  }, []);

  const handleRouteCalculated = (calculatedDistance: number, calculatedTime: number) => {
    setDistance(calculatedDistance);
    setEstimatedTime(calculatedTime);
  };

  useEffect(() => {
    if (distance !== null && distance > 0 && currentOrder?.id === orderId) {
      getOrderFee(distance);
    }
  }, [distance, getOrderFee, currentOrder?.id, orderId]);

  useEffect(() => {
    if (orderFee && currentOrder?.id) {
      updatePublicOrder({
        id: currentOrder.id,
        order: {
          finalFee: orderFee,
        },
      });
    }
  }, [currentOrder?.id, orderFee, updatePublicOrder]);

  const renderDeliveryTime = () => {
    if (estimatedTime === null) return null;
    const calculatedBaseTime = Math.round(estimatedTime);
    const calculatedBufferTime = calculatedBaseTime + 15;
    const baseTime = calculatedBaseTime < 20 ? 20 : calculatedBaseTime;
    const bufferTime = calculatedBufferTime < 30 ? 30 : calculatedBufferTime;

    if (bufferTime < 60) {
      return `${baseTime}-${bufferTime}`;
    }
    if (baseTime < 60) {
      const bufferHours = Math.floor(bufferTime / 60);
      const bufferMins = bufferTime % 60;
      return `${baseTime} min - ${bufferHours}:${String(bufferMins).padStart(2, '0')} hr`;
    }

    const baseHours = Math.floor(baseTime / 60);
    const baseMins = baseTime % 60;
    const bufferHours = Math.floor(bufferTime / 60);
    const bufferMins = bufferTime % 60;
    return `${baseHours}:${String(baseMins).padStart(2, '0')} - ${bufferHours}:${String(bufferMins).padStart(2, '0')}`;
  };

  const deliveryTimeUnit = (() => {
    if (estimatedTime === null) return '';
    const calculatedBufferTime = Math.round(estimatedTime) + 15;
    const bufferTime = calculatedBufferTime < 30 ? 30 : calculatedBufferTime;
    return bufferTime < 60 ? 'minutes' : 'hours';
  })();

  const hasSuccessfulPayment = paymentsList?.some(
    (payment) => payment.status === KpayPaymentStatus.SUCCESSFUL,
  );
  const hasBothLocations = !!currentOrder?.locationFrom && !!currentOrder?.locationTo;

  const stats = [
    {
      label: 'Pickup',
      value: currentOrder?.locationFrom ? 'Set' : 'Needed',
      icon: faLocationDot,
    },
    {
      label: 'Destination',
      value: currentOrder?.locationTo ? 'Set' : 'Needed',
      icon: faRoute,
    },
    {
      label: 'Next Action',
      value: hasSuccessfulPayment ? 'Track Order' : 'Complete Payment',
      icon: faMoneyBillWave,
    },
  ];

  return (
    <APIProvider apiKey={ENVIRONMENTS.GOOGLE_MAPS_API_KEY}>
      {currentOrder?.locationFrom && currentOrder?.locationTo ? (
        <RouteCalculator
          locationFrom={{
            latitude: currentOrder.locationFrom.latitude ?? 0,
            longitude: currentOrder.locationFrom.longitude ?? 0,
          }}
          locationTo={{
            latitude: currentOrder.locationTo.latitude ?? 0,
            longitude: currentOrder.locationTo.longitude ?? 0,
          }}
          onRouteCalculated={handleRouteCalculated}
        />
      ) : null}

      <PublicPage>
        <PublicPageHero
          eyebrow="Order"
          title={currentOrder?.referenceId || 'Set delivery locations'}
          description="Set pickup and destination, then continue."
        />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <PublicStatCard
              key={stat.label}
              label={stat.label}
              value={currentOrder ? stat.value : 'Loading…'}
              icon={<FontAwesomeIcon icon={stat.icon} />}
            />
          ))}
        </section>

        <PublicSectionCard
          className="border-primary-200"
          eyebrow="Locations"
          title="Pickup and destination"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="min-w-0 rounded-lg border border-slate-200 bg-slate-50/85 p-4">
              <header className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-normal uppercase tracking-[0.24em] text-slate-400">
                    Pickup
                  </p>
                </div>
                {!currentOrder?.locationFrom ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      onClick={handleGetCurrentLocation}
                      isLoading={gettingCurrentLocation}
                      className="py-1.5! px-3.5! text-xs cursor-pointer"
                      primary
                    >
                      Use Current
                    </Button>
                    <Button
                      onClick={() => dispatch(setUpdateOrderLocationFromModal(true))}
                      className="py-1.5! px-3.5! text-xs cursor-pointer"
                    >
                      Set Location
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="cursor-pointer text-slate-500 transition-colors hover:text-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(setUpdateOrderLocationFromModal(true));
                    }}
                    aria-label="Edit pickup location"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
                  </button>
                )}
              </header>

              {currentOrder?.locationFrom ? (
                <div className="space-y-3">
                  <AdministrativeLocation location={currentOrder.locationFrom} />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center">
                  <p className="text-sm font-normal text-slate-800">Pickup location not set</p>
                </div>
              )}
            </article>

            <article className="min-w-0 rounded-lg border border-slate-200 bg-slate-50/85 p-4">
              <header className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-normal uppercase tracking-[0.24em] text-slate-400">
                    Destination
                  </p>
                </div>
                <button
                  type="button"
                  className="cursor-pointer text-slate-500 transition-colors hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(setUpdateOrderLocationToModal(true));
                  }}
                  aria-label="Edit delivery destination"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
                </button>
              </header>

              {currentOrder?.locationTo ? (
                <div className="space-y-3">
                  <AdministrativeLocation location={currentOrder.locationTo} />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center">
                  <p className="text-sm font-normal text-slate-800">Destination not set</p>
                </div>
              )}
            </article>
          </div>

          {hasBothLocations ? (
            <PublicSectionCard
              eyebrow="Route Summary"
              title="Distance, time, and fee"
              className='mt-4'
            >
              {distance === null || estimatedTime === null ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <article
                      key={i}
                      className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/85 p-4"
                    >
                      <SkeletonLine className="h-3 w-20" />
                      <SkeletonLine className="h-7 w-28" />
                      <SkeletonLine className="h-3 w-16" />
                    </article>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <article className="rounded-md border border-slate-200 bg-slate-50/85 p-4">
                      <p className="text-[11px] font-normal uppercase tracking-[0.24em] text-slate-400">
                        Distance
                      </p>
                      <p className="mt-2 text-2xl font-normal text-slate-900">{distance.toFixed(2)}</p>
                      <p className="mt-1 text-xs text-slate-500">kilometers</p>
                    </article>

                    <article className="rounded-lg border border-slate-200 bg-slate-50/85 p-4">
                      <p className="text-[11px] font-normal uppercase tracking-[0.24em] text-slate-400">
                        Delivery Time
                      </p>
                      <p className="mt-2 text-2xl font-normal text-slate-900">{renderDeliveryTime()}</p>
                      <p className="mt-1 text-xs text-slate-500">{deliveryTimeUnit}</p>
                    </article>

                    <article className="rounded-lg border border-slate-200 bg-slate-50/85 p-4">
                      <p className="text-[11px] font-normal uppercase tracking-[0.24em] text-slate-400">
                        Delivery Fee
                      </p>
                      {(orderFee !== undefined && orderFee > 0) ||
                        (currentOrder?.finalFee !== null &&
                          currentOrder?.finalFee !== undefined &&
                          currentOrder.finalFee > 0) ? (
                        <>
                          <p className="mt-2 text-2xl font-normal text-slate-900">
                            {formatCurrency(orderFee ?? (currentOrder?.finalFee ?? 0))}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">including VAT</p>
                        </>
                      ) : (
                        <div className="mt-2 space-y-3">
                          <SkeletonLine className="h-7 w-28" />
                          <SkeletonLine className="h-3 w-16" />
                        </div>
                      )}
                    </article>
                  </div>

                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/85 p-4">
                    <p className="text-sm text-slate-600 font-normal inline-block flex items-center gap-2">
                      Fee is based on distance between the two locations.{' '}
                      <span className="inline-block">
                        <Button
                          route="/about/orders/fees"
                          styled={false}
                          className="!inline-block !px-0 text-sm text-primary underline underline-offset-2 hover:text-primary-600"
                        >
                          Learn more about fees
                        </Button>
                      </span>
                    </p>
                  </div>
                </>
              )}
            </PublicSectionCard>
          ) : null}

          <div className="mt-5 flex items-center gap-3 justify-between">
            <Button
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
            >
              Back
            </Button>
            {hasSuccessfulPayment ? (
              <Button
                primary
                isLoading={createOrderAssignmentIsLoading}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentOrder?.id) {
                    createPublicOrderAssignment({
                      orderId: currentOrder.id,
                    });
                  }
                }}
              >
                Track Order
              </Button>
            ) : (
              <Button
                primary
                disabled={!currentOrder?.locationFrom || !currentOrder?.locationTo}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setSelectedOrder(currentOrder));
                  dispatch(setOrderPaymentModal(true));
                }}
              >
                {!currentOrder?.locationFrom || !currentOrder?.locationTo
                  ? 'Set Both Locations to Continue'
                  : 'Complete Payment'}
              </Button>
            )}
          </div>
        </PublicSectionCard>

        <UpdateOrderLocationFrom />
        <UpdateOrderLocationTo />
        <OrderPayment />
      </PublicPage>
    </APIProvider>
  );
};

export default PublicOrderDetails;
