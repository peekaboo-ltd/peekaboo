import {
  useDeferOrderPayment,
  useGetPublicOrder,
  useGetOrderFees,
  useUpdatePublicOrder,
} from '@/hooks/orders/orders.hooks';
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
import {
  DEVELOPMENT_PAYMENT_AMOUNT_RWF,
  ENVIRONMENTS,
} from '@/constants/environments.constants';
import RouteCalculator from '@/containers/locations/RouteCalculator';
import AdministrativeLocation from '@/containers/locations/AdministrativeLocation';
import NearestPlace from '@/containers/locations/NearestPlace';
import LocationMiniMap from '@/components/orders/LocationMiniMap';
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
import { OrderPaymentStatus, type OrderLocation } from '@/types/order.type';
import {
  faLocationDot,
  faMoneyBillWave,
  faRoute,
} from '@fortawesome/free-solid-svg-icons';
import {
  OrderStageRail,
  PublicPage,
  PublicPageHero,
  PublicSectionCard,
  PublicStatCard,
} from '@/components/layout/PublicPage';
import { useFetchUserById } from '@/hooks/users/users.hooks';

const SkeletonLine = ({ className = '' }: { className?: string }) => (
  <span className={`inline-block animate-pulse rounded bg-[var(--surface)] ${className}`} />
);

interface LocationCardProps {
  label: 'Pickup' | 'Destination';
  location?: OrderLocation | null;
  emptyHint: string;
  onEdit: () => void;
  onUseCurrent?: () => void;
  usingCurrentLocation?: boolean;
}

const LocationCard = ({
  label,
  location,
  emptyHint,
  onEdit,
  onUseCurrent,
  usingCurrentLocation = false,
}: LocationCardProps) => (
  <article className="relative min-w-0">
    <header className="mb-4 flex items-start justify-between gap-3">
      <p className="text-[10px] font-medium text-[var(--muted)]">
        {label}
      </p>
      {location ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onEdit();
          }}
          aria-label={`Edit ${label.toLowerCase()} location`}
          className="flex size-9 items-center justify-center rounded-(--radius-control) border border-(--line) text-(--muted) outline-none transition-[background-color,color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0,0,1,1)] hover:border-(--ink) hover:text-(--ink) active:shadow-[var(--press-on-paper)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
        >
          <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
        </button>
      ) : (
        <div className="flex flex-wrap justify-end gap-2">
          {onUseCurrent ? (
            <Button
              onClick={onUseCurrent}
              isLoading={usingCurrentLocation}
              primary
              className="py-1.5! px-3.5! text-xs cursor-pointer"
            >
              Use current location
            </Button>
          ) : null}
          <Button
            onClick={onEdit}
            className="py-1.5! px-3.5! text-xs cursor-pointer"
          >
            Set location
          </Button>
        </div>
      )}
    </header>

    {location ? (
      <div className="space-y-3">
        <NearestPlace location={location} />
        <AdministrativeLocation location={location} />
        <LocationMiniMap location={location} label={label} />
      </div>
    ) : (
      <div className="flex min-h-[7rem] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">{emptyHint}</p>
      </div>
    )}
  </article>
);

const PublicOrderDetails = () => {
  useDocumentTitle('Order Details');

  const dispatch = useAppDispatch();
  const { order } = useAppSelector((state) => state.order);
  const { user: authenticatedUser } = useAppSelector((state) => state.auth);
  const { user } = useAppSelector((state) => state.user);
  const { paymentsList } = useAppSelector((state) => state.payment);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const orderId = id as UUID | undefined;
  const currentOrder = order?.id === orderId ? order : undefined;

  // GET USER
  const { fetchUserById } = useFetchUserById();

  useEffect(() => {
    if (authenticatedUser?.id) {
      fetchUserById(authenticatedUser.id);
    }
  }, [authenticatedUser?.id, fetchUserById]);

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
    deferOrderPayment,
    isSuccess: deferOrderPaymentIsSuccess,
    isLoading: deferOrderPaymentIsLoading,
  } = useDeferOrderPayment();

  useEffect(() => {
    if (deferOrderPaymentIsSuccess) {
      navigate(`/p/orders/${currentOrder?.id}/tracking`);
    }
  }, [deferOrderPaymentIsSuccess, navigate, currentOrder?.id]);

  // GET CURRENT LOCATION
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

  // SET USER DEFAULT LOCATION
  useEffect(() => {
    let defaultLocation = user?.organizationMembership?.[0]?.organization?.defaultLocation;
    if (user?.defaultLocation) defaultLocation = user.defaultLocation;
    if (defaultLocation && currentOrder?.id && !currentOrder?.locationFrom) {
      updatePublicOrder({
        id: currentOrder?.id,
        order: {
          locationFrom: defaultLocation,
        },
      });
    }
  }, [currentOrder?.id, currentOrder?.locationFrom, updatePublicOrder, user?.defaultLocation, user?.organizationMembership]);

  // UPDATE ORDER LOCATION FROM
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
  const hasDeferredPayment =
    currentOrder?.paymentStatus === OrderPaymentStatus.PENDING ||
    currentOrder?.paymentStatus === OrderPaymentStatus.COMPLETED;
  const hasPaidEquivalent = hasSuccessfulPayment || hasDeferredPayment;
  const isOrganizationUser = !!user?.organizationMembership?.length;
  const canDeferPayment =
    isOrganizationUser && !!(currentOrder?.isBusinessOrder || currentOrder?.organizationId);

  const pickup = currentOrder?.locationFrom;
  const dropoff = currentOrder?.locationTo;
  const hasBothLocations = Boolean(pickup && dropoff);
  // Pickup and drop-off must be two different places, otherwise the route (and
  // therefore the fee) has no meaning.
  const isSameLocation = Boolean(
    pickup &&
      dropoff &&
      (pickup.placeId
        ? pickup.placeId === dropoff.placeId
        : pickup.latitude !== null &&
          pickup.longitude !== null &&
          pickup.latitude === dropoff.latitude &&
          pickup.longitude === dropoff.longitude),
  );
  const locationsReady = hasBothLocations && !isSameLocation;

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
      value: hasPaidEquivalent
        ? 'Track Order'
        : canDeferPayment
          ? 'Defer Payment'
          : 'Complete Payment',
      icon: faMoneyBillWave,
    },
  ];

  return (
    // The Maps APIProvider is mounted app-wide in App.tsx.
    <>
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
          eyebrow="Delivery setup"
          title={currentOrder?.referenceId || 'Set delivery locations'}
          description="Confirm where the delivery starts and ends. We’ll calculate the route and price before payment."
        />

        <OrderStageRail currentStage="locations" />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats?.map((stat) => (
            <PublicStatCard
              key={stat.label}
              label={stat.label}
              value={currentOrder ? stat.value : 'Loading…'}
              icon={<FontAwesomeIcon icon={stat.icon} />}
            />
          ))}
        </section>

        <PublicSectionCard
          eyebrow="Route"
          title="Pickup and destination"
          description="Set two different locations to calculate the delivery."
        >
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 lg:divide-x lg:divide-[var(--line)] [&>article:last-child]:lg:pl-10">
            <LocationCard
              label="Pickup"
              location={pickup}
              emptyHint="No pickup set yet."
              onEdit={() => dispatch(setUpdateOrderLocationFromModal(true))}
              onUseCurrent={handleGetCurrentLocation}
              usingCurrentLocation={gettingCurrentLocation}
            />
            <LocationCard
              label="Destination"
              location={dropoff}
              emptyHint="No destination set yet."
              onEdit={() => dispatch(setUpdateOrderLocationToModal(true))}
            />
          </div>

          {isSameLocation ? (
            <p className="mt-6 rounded-(--radius-control) bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)]">
              Pickup and destination are the same place. Choose a different
              destination to continue.
            </p>
          ) : null}

          {locationsReady ? (
            <div className="mt-8 border-t border-[var(--line)] pt-6">
              <div className="mb-5">
                <p className="text-[10px] font-medium text-[var(--muted)]">
                  Route summary
                </p>
                <h3 className="mt-1 text-base font-medium text-[var(--ink)]">
                  Distance, time, and fee
                </h3>
              </div>

              {distance === null || estimatedTime === null ? (
                <div className="grid gap-6 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                      <SkeletonLine className="h-3 w-20" />
                      <SkeletonLine className="h-7 w-28" />
                      <SkeletonLine className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-3 md:divide-x md:divide-[var(--line)] [&>div:not(:first-child)]:md:pl-6">
                    <div>
                      <p className="text-[10px] text-[var(--muted)]">
                        Distance
                      </p>
                      <p className="mt-2 text-2xl font-medium text-[var(--ink)]">{distance.toFixed(2)}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">kilometers</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-[var(--muted)]">
                        Delivery time
                      </p>
                      <p className="mt-2 text-2xl font-medium text-[var(--ink)]">{renderDeliveryTime()}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{deliveryTimeUnit}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-[var(--muted)]">
                        Delivery fee
                      </p>
                      {(orderFee !== undefined && orderFee > 0) ||
                        (currentOrder?.finalFee !== null &&
                          currentOrder?.finalFee !== undefined &&
                          currentOrder.finalFee > 0) ? (
                        <>
                          <p className="mt-2 text-2xl font-medium text-[var(--ink)]">
                            {formatCurrency(orderFee ?? (currentOrder?.finalFee ?? 0))}
                          </p>
                          <p className="mt-1 text-xs text-[var(--muted)]">including VAT</p>
                          {ENVIRONMENTS.isPaymentSimulation ? (
                          <p className="mt-2 text-xs leading-snug text-[var(--ink)]">
                              Payments are simulated in this environment. No real
                              charge will be made.
                            </p>
                          ) : null}
                          {ENVIRONMENTS.isDevPrice ? (
                            <p className="mt-2 text-xs leading-snug text-[var(--ink)]">
                              Catalog fee shown. You will only be charged{' '}
                              {formatCurrency(DEVELOPMENT_PAYMENT_AMOUNT_RWF)} at
                              checkout.
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <div className="mt-2 space-y-3">
                          <SkeletonLine className="h-7 w-28" />
                          <SkeletonLine className="h-3 w-16" />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-5 text-sm text-[var(--muted)]">
                    Fee is based on distance between the two locations.{' '}
                    <Link
                      to="/about/orders/fees"
                      className="font-medium text-[var(--ink)] underline underline-offset-2"
                    >
                      Learn more about fees
                    </Link>
                  </p>
                  {ENVIRONMENTS.isPaymentSimulation ? (
                    <p className="mt-2 text-sm text-[var(--ink)]">
                      Payments are simulated in this environment.
                    </p>
                  ) : null}
                  {ENVIRONMENTS.isDevPrice ? (
                    <p className="mt-2 text-sm text-[var(--ink)]">
                      Environment pricing: checkout charges{' '}
                      {formatCurrency(DEVELOPMENT_PAYMENT_AMOUNT_RWF)} only.
                    </p>
                  ) : null}
                </>
              )}
            </div>
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
            {hasPaidEquivalent ? (
              <Button
                primary
                onClick={(e) => {
                  e.preventDefault();
                  if (currentOrder?.id) {
                    navigate(`/p/orders/${currentOrder.id}/tracking`);
                  }
                }}
              >
                Track order
              </Button>
            ) : canDeferPayment ? (
              <Button
                primary
                isLoading={deferOrderPaymentIsLoading}
                disabled={!locationsReady}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentOrder?.id) {
                    deferOrderPayment({ id: currentOrder.id });
                  }
                }}
              >
                {!hasBothLocations
                  ? 'Set both locations to continue'
                  : isSameLocation
                    ? 'Pickup and destination must differ'
                    : 'Defer payment'}
              </Button>
            ) : (
              <Button
                primary
                disabled={!locationsReady}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setSelectedOrder(currentOrder));
                  dispatch(setOrderPaymentModal(true));
                }}
              >
                {!hasBothLocations
                  ? 'Set both locations to continue'
                  : isSameLocation
                    ? 'Pickup and destination must differ'
                    : 'Complete payment'}
              </Button>
            )}
          </div>
        </PublicSectionCard>

        <UpdateOrderLocationFrom />
        <UpdateOrderLocationTo />
        <OrderPayment />
      </PublicPage>
    </>
  );
};

export default PublicOrderDetails;
