import {
  useDeferOrderPayment,
  useGetPublicOrder,
  useUpdatePublicOrder,
} from '@/hooks/orders/orders.hooks';
import { useQuotePublicOrderMutation } from '@/api/mutations/orders.mutations';
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
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  DEVELOPMENT_PAYMENT_AMOUNT_RWF,
  ENVIRONMENTS,
} from '@/constants/environments.constants';
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
import { PaymentStatus, PaymentType } from '@/types/payment.types';
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
import { faCircleCheck, faCopy, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { useI18n } from '@/i18n/i18n';

interface LocationCardProps {
  label: string;
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
}: LocationCardProps) => {
  const { t } = useI18n();
  return (
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
          aria-label={t('publicOrder.changeLocation', { location: label.toLowerCase() })}
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
          {t('publicOrder.addressDetails')}
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
              {t('publicOrder.useCurrent')}
            </Button>
          ) : null}
          <Button onClick={onEdit} size="sm">
            {t('publicOrder.setLocation')}
          </Button>
        </div>
      </div>
    )}
  </article>
  );
};

const PublicOrderDetails = () => {
  const { t } = useI18n();
  useDocumentTitle(t('publicOrder.docTitle'));

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
  const [quotePublicOrder, { isLoading: quoteIsLoading }] =
    useQuotePublicOrderMutation();

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
      toast.error(t('publicOrder.currentLocationError'));
    } finally {
      setGettingCurrentLocation(false);
    }
  }, [currentOrder?.id, t, updatePublicOrder]);

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
    if (currentOrder?.contactEmail) {
      setEmailDraft(currentOrder.contactEmail);
    }
  }, [currentOrder?.contactEmail, currentOrder?.preferredContactMethod]);

  const isSameCoordinates = useCallback(
    (from?: OrderLocation | null, to?: OrderLocation | null) => {
      if (!from || !to) return false;
      if (from.placeId && to.placeId) {
        return from.placeId === to.placeId;
      }
      const fromLat = Number(from.latitude);
      const fromLng = Number(from.longitude);
      const toLat = Number(to.latitude);
      const toLng = Number(to.longitude);
      if (
        !Number.isFinite(fromLat) ||
        !Number.isFinite(fromLng) ||
        !Number.isFinite(toLat) ||
        !Number.isFinite(toLng)
      ) {
        return false;
      }
      return fromLat === toLat && fromLng === toLng;
    },
    [],
  );

  // A successful quote replaces the order in the store, so the location objects
  // and the quoted* fields get new identities on every response. Key the quote
  // on the coordinates themselves instead, so an unchanged route quotes once.
  const routeKey = useMemo(() => {
    const pickup = currentOrder?.locationFrom;
    const dropoff = currentOrder?.locationTo;
    if (!pickup || !dropoff || isSameCoordinates(pickup, dropoff)) return null;
    const serialize = (location: OrderLocation) =>
      `${location.placeId ?? ''}:${location.latitude ?? ''},${location.longitude ?? ''}`;
    return `${serialize(pickup)}|${serialize(dropoff)}`;
  }, [currentOrder?.locationFrom, currentOrder?.locationTo, isSameCoordinates]);

  // Read at quote time only, so a new quote does not retrigger the effect.
  const quoteFallbackRef = useRef<{
    distanceKm?: number | null;
    durationMinutes?: number | null;
  }>({});
  quoteFallbackRef.current = {
    distanceKm: currentOrder?.quotedDistanceKm,
    durationMinutes: currentOrder?.quotedDurationMinutes,
  };

  useEffect(() => {
    if (!currentOrder?.id || !routeKey) {
      setDistance(null);
      setEstimatedTime(null);
      return;
    }

    let active = true;
    quotePublicOrder({ orderId: currentOrder.id })
      .unwrap()
      .then((response) => {
        if (!active) return;
        const quote = response?.data?.quote;
        if (!quote) return;
        setDistance(Number(quote.distanceKm));
        setEstimatedTime(Number(quote.durationMinutes));
        if (response.data.order) {
          dispatch(setOrder(response.data.order));
        }
      })
      .catch(() => {
        if (!active) return;
        const fallbackDistance = quoteFallbackRef.current.distanceKm;
        const fallbackDuration = quoteFallbackRef.current.durationMinutes;
        if (fallbackDistance != null && fallbackDuration != null) {
          setDistance(Number(fallbackDistance));
          setEstimatedTime(Number(fallbackDuration));
          return;
        }
        setDistance(null);
        setEstimatedTime(null);
        toast.error(t('publicOrder.routeError'));
      });

    return () => {
      active = false;
    };
  }, [currentOrder?.id, routeKey, dispatch, quotePublicOrder, t]);
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
        setEmailError(t('publicOrder.emailInvalid'));
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
    [currentOrder?.id, t, updatePublicOrder],
  );

  const hasSuccessfulPayment = paymentsList?.some(
    (payment) => payment.status === PaymentStatus.SUCCESSFUL,
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
  const isSameLocation = isSameCoordinates(pickup, dropoff);
  const locationsReady = hasBothLocations && !isSameLocation;

  const feeValue =
    currentOrder?.finalFee ??
    currentOrder?.quotedAmount ??
    currentOrder?.initialFee ??
    0;

  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    // The Maps APIProvider is mounted app-wide in App.tsx.
    <>
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
              <p className="type-eyebrow">{t('publicOrder.setup')}</p>
              <h1 className="type-page-title">
                {currentOrder?.referenceId || t('publicOrder.setLocations')}{' '}
                {currentOrder?.referenceId ? (
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded-(--radius-control) align-middle hover:bg-(--surface-hover)"
                    aria-label={t('publicOrder.copyReference')}
                    onClick={() => {
                      void navigator.clipboard.writeText(currentOrder.referenceId);
                      toast.success(t('publicOrder.referenceCopied'));
                      setCopied(true);
                    }}
                  >
                    <FontAwesomeIcon icon={copied ? faCircleCheck : faCopy} className="size-3.5" />
                  </button>
                ) : null}
              </h1>
              <p className="type-meta max-w-[52ch]">
                {t('publicOrder.setupDescription')}
              </p>
            </hgroup>

            <div className="grid gap-3 sm:grid-cols-2">
              <LocationCard
                label={t('publicOrder.pickup')}
                location={pickup}
                emptyHint={t('publicOrder.notSet')}
                onEdit={() => dispatch(setUpdateOrderLocationFromModal(true))}
                onInspect={() =>
                  pickup && setLocationDetail({ label: t('publicOrder.pickup'), location: pickup })
                }
                onUseCurrent={handleGetCurrentLocation}
                usingCurrentLocation={gettingCurrentLocation}
              />
              <LocationCard
                label={t('publicOrder.destination')}
                location={dropoff}
                emptyHint={t('publicOrder.notSet')}
                onEdit={() => dispatch(setUpdateOrderLocationToModal(true))}
                onInspect={() =>
                  dropoff &&
                  setLocationDetail({ label: t('publicOrder.destination'), location: dropoff })
                }
              />
            </div>

            {isSameLocation ? (
              <p className="card-quiet px-4 py-3 text-sm text-(--ink)">
                {t('publicOrder.sameLocation')}
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
                {t('publicOrder.feeExplanation')}{' '}
                <Link to="/about/orders/fees" className="link-sweep underline underline-offset-3 text-(--ink)">
                  {t('publicOrder.howFeesWork')}
                </Link>
                {ENVIRONMENTS.isPaymentSimulation
                  ? ` · ${t('publicOrder.simulationNote')}`
                  : ''}
                {ENVIRONMENTS.isDevPrice
                  ? ` · ${t('publicOrder.devPriceNote', { amount: formatCurrency(DEVELOPMENT_PAYMENT_AMOUNT_RWF) })}`
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
                {t('tracking.back')}
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
                  {t('publicOrder.track')}
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
                    ? t('publicOrder.setBoth')
                    : isSameLocation
                      ? t('publicOrder.locationsDiffer')
                      : t('publicOrder.deferPayment')}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  disabled={!locationsReady || quoteIsLoading || feeValue <= 0}
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(setSelectedOrder(currentOrder));
                    dispatch(setOrderPaymentModal(true));
                  }}
                >
                  {!hasBothLocations
                    ? t('publicOrder.setBoth')
                    : isSameLocation
                      ? t('publicOrder.locationsDiffer')
                      : t('publicOrder.completePayment')}
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
