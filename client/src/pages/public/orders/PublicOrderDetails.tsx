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
import { motion } from 'framer-motion';
import {
  DEVELOPMENT_PAYMENT_AMOUNT_RWF,
  ENVIRONMENTS,
} from '@/constants/environments.constants';
import RouteCalculator from '@/containers/locations/RouteCalculator';
import NearestPlace from '@/containers/locations/NearestPlace';
import Button from '@/components/inputs/Button';
import ContactMethodPicker from '@/components/orders/ContactMethodPicker';
import LocationDetailModal, {
  type LocationDetail,
} from '@/components/orders/LocationDetailModal';
import RouteSummary from '@/components/orders/RouteSummary';
import { formatCurrency } from '@/utils/strings.util';
import UpdateOrderLocationFrom from '@/components/modals/UpdateOrderLocationFrom';
import UpdateOrderLocationTo from '@/components/modals/UpdateOrderLocationTo';
import OrderPayment from '@/components/modals/OrderPayment';
import { useFetchPublicPayments } from '@/hooks/payments/payment.hooks';
import { KpayPaymentStatus, PaymentType } from '@/types/payment.types';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  OrderPaymentStatus,
  PreferredContactMethod,
  type OrderLocation,
} from '@/types/order.type';
import { PublicPage } from '@/components/layout/PublicPage';
import { useFetchUserById } from '@/hooks/users/users.hooks';
import { entranceVariants } from '@/pages/home/home.animations';
import OrderSetupHeroMap from './components/OrderSetupHeroMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';

interface LocationCardProps {
  label: 'Pickup' | 'Destination';
  location?: OrderLocation | null;
  emptyHint: string;
  onEdit: () => void;
  onInspect: () => void;
  onUseCurrent?: () => void;
  usingCurrentLocation?: boolean;
}

/**
 * One end of the route, reduced to the line a person actually reads.
 *
 * This used to render the nearest place, the full province/district/sector
 * breakdown, and a mini map inline — roughly 220px per card, for information
 * most senders never check. The breakdown and the map now live one click away
 * in LocationDetailModal, which is what makes the page fit a screen.
 */
const LocationCard = ({
  label,
  location,
  emptyHint,
  onEdit,
  onInspect,
  onUseCurrent,
  usingCurrentLocation = false,
}: LocationCardProps) => (
  <article className="card-quiet flex min-w-0 flex-col gap-2 px-4 py-2">
    <header className="flex items-center justify-between gap-3">
      <p className="type-eyebrow">{label}</p>
      {location ? (
        <FontAwesomeIcon
          icon={faPenToSquare}
          className="type-meta shrink-0 cursor-pointer text-(--ink) p-2 underline underline-offset-2 size-3.5 rounded-(--radius-control) hover:bg-(--surface-hover)"
          onClick={(e) => {
            e.preventDefault();
            onEdit();
          }}
          aria-label={`Change ${label.toLowerCase()} location`}
        />
      ) : null}
    </header>

    {location ? (
      <>
        <NearestPlace location={location} />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onInspect();
          }}
          className="type-meta w-fit cursor-pointer text-(--ink) underline underline-offset-2"
        >
          Address details
        </button>
      </>
    ) : (
      <div className="flex flex-col items-start gap-2">
        <p className="type-meta">{emptyHint}</p>
        <div className="flex flex-wrap gap-2">
          {onUseCurrent ? (
            <Button
              onClick={onUseCurrent}
              isLoading={usingCurrentLocation}
              variant="primary"
              size="sm"
            >
              Use current location
            </Button>
          ) : null}
          <Button onClick={onEdit} size="sm">
            Set location
          </Button>
        </div>
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
  const [locationDetail, setLocationDetail] = useState<LocationDetail | null>(null);
  const [emailDraft, setEmailDraft] = useState('');
  const [emailError, setEmailError] = useState('');

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

  // Same one-field patch the page already uses for locations and the fee.
  const handleContactMethodChange = useCallback(
    (method: PreferredContactMethod) => {
      if (!currentOrder?.id) return;
      setEmailError('');

      // EMAIL is the only method the server can reject, because it is the only
      // one that needs an address we may not have. Hold it locally until the
      // address is valid rather than firing a request we know will fail.
      if (method === PreferredContactMethod.EMAIL) {
        const existing = currentOrder.contactEmail || emailDraft;
        if (!existing) {
          dispatch(setOrder({ ...currentOrder, preferredContactMethod: method }));
          return;
        }
        updatePublicOrder({
          id: currentOrder.id,
          order: { preferredContactMethod: method, contactEmail: existing },
        });
        return;
      }

      updatePublicOrder({
        id: currentOrder.id,
        order: { preferredContactMethod: method },
      });
    },
    [currentOrder, dispatch, emailDraft, updatePublicOrder],
  );

  const handleEmailChange = useCallback(
    (value: string) => {
      setEmailDraft(value);
      const trimmed = value.trim();
      if (!trimmed) {
        setEmailError('');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setEmailError('Enter a valid email address.');
        return;
      }
      setEmailError('');
      if (currentOrder?.id) {
        updatePublicOrder({
          id: currentOrder.id,
          order: {
            preferredContactMethod: PreferredContactMethod.EMAIL,
            contactEmail: trimmed,
          },
        });
      }
    },
    [currentOrder?.id, updatePublicOrder],
  );

  const handleRouteCalculated = (calculatedDistance: number, calculatedTime: number) => {
    setDistance(calculatedDistance);
    setEstimatedTime(calculatedTime);
  };

  useEffect(() => {
    if (distance !== null && distance > 0 && currentOrder?.id === orderId) {
      getOrderFee(distance);
    }
  }, [distance, getOrderFee, currentOrder?.id, orderId]);

  // Only write the fee when it actually changed. Without the guard this fires
  // on every render that touches the order — and because the server updates by
  // saving the whole row (`save({...orderExists, ...order})`), a fee write
  // holding a stale snapshot silently reverts any field saved alongside it.
  // That is what was undoing the contact-method choice a moment after it saved.
  useEffect(() => {
    if (!orderFee || !currentOrder?.id) return;
    if (Number(currentOrder.finalFee) === Number(orderFee)) return;
    updatePublicOrder({
      id: currentOrder.id,
      order: { finalFee: orderFee },
    });
  }, [currentOrder?.id, currentOrder?.finalFee, orderFee, updatePublicOrder]);

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

  const feeValue = orderFee ?? currentOrder?.finalFee ?? 0;


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

      <PublicPage viewport>
        <motion.div
          className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-8"
          variants={entranceVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left column is the only scroller: below the guaranteed height the
              controls scroll inside the viewport rather than pushing the map
              and the pay button off it. */}
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto lg:pr-1">
            <hgroup className="flex flex-col gap-1">
              <p className="type-eyebrow">Delivery setup</p>
              <h1 className="type-page-title">
                {currentOrder?.referenceId || 'Set delivery locations'}
              </h1>
              <p className="type-meta max-w-[52ch]">
                Set both ends of the route. We price it before you pay.
              </p>
            </hgroup>

            <div className="grid gap-3 sm:grid-cols-2">
              <LocationCard
                label="Pickup"
                location={pickup}
                emptyHint="Not set yet."
                onEdit={() => dispatch(setUpdateOrderLocationFromModal(true))}
                onInspect={() =>
                  pickup && setLocationDetail({ label: 'Pickup', location: pickup })
                }
                onUseCurrent={handleGetCurrentLocation}
                usingCurrentLocation={gettingCurrentLocation}
              />
              <LocationCard
                label="Destination"
                location={dropoff}
                emptyHint="Not set yet."
                onEdit={() => dispatch(setUpdateOrderLocationToModal(true))}
                onInspect={() =>
                  dropoff &&
                  setLocationDetail({ label: 'Destination', location: dropoff })
                }
              />
            </div>

            {isSameLocation ? (
              <p className="card-quiet px-4 py-3 text-sm text-(--ink)">
                Pickup and destination are the same place. Choose a different
                destination to continue.
              </p>
            ) : null}

            <ContactMethodPicker
              value={currentOrder?.preferredContactMethod}
              onChange={handleContactMethodChange}
              email={emailDraft || currentOrder?.contactEmail}
              onEmailChange={handleEmailChange}
              emailError={emailError}
            />

            {locationsReady ? (
              <RouteSummary
                distance={distance}
                estimatedTime={estimatedTime}
                fee={feeValue}
              />
            ) : null}

            {locationsReady && feeValue > 0 ? (
              <p className="type-meta">
                Fee is based on the distance between the two locations.{' '}
                <Link to="/about/orders/fees" className="link-sweep underline underline-offset-3 text-(--ink)">
                  How fees work
                </Link>
                {ENVIRONMENTS.isPaymentSimulation
                  ? ' · Payments are simulated here; no real charge is made.'
                  : ''}
                {ENVIRONMENTS.isDevPrice
                  ? ` · Checkout charges ${formatCurrency(DEVELOPMENT_PAYMENT_AMOUNT_RWF)} only.`
                  : ''}
              </p>
            ) : null}

            <nav className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
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
                  variant="primary"
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
                  variant="primary"
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
                  variant="primary"
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
            </nav>
          </div>

          {/* The map fills its cell instead of dictating a 4/3 height, and
              carries the route figures that used to sit in a card below. */}
          <div className="min-h-0 max-lg:hidden">
            <OrderSetupHeroMap
              pickup={pickup}
              dropoff={dropoff}
              distance={distance}
              estimatedTime={estimatedTime}
              className="h-full"
            />
          </div>
        </motion.div>

        <LocationDetailModal
          detail={locationDetail}
          onClose={() => setLocationDetail(null)}
        />
        <UpdateOrderLocationFrom />
        <UpdateOrderLocationTo />
        <OrderPayment />
      </PublicPage>
    </>
  );
};

export default PublicOrderDetails;
