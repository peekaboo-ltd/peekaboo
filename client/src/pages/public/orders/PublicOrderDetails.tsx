import { useGetOrder, useGetOrderFees, useUpdateOrder } from '@/hooks/orders/orders.hooks';
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
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import RouteCalculator from '@/containers/locations/RouteCalculator';
import AdministrativeLocation from '@/containers/locations/AdministrativeLocation';
import { useCreateOrderAssignment } from '@/hooks/orders/orderAssignments.hooks';
import Button from '@/components/inputs/Button';
import { formatCurrency } from '@/utils/strings.util';
import UpdateOrderLocationFrom from '@/components/modals/UpdateOrderLocationFrom';
import UpdateOrderLocationTo from '@/components/modals/UpdateOrderLocationTo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import OrderPayment from '@/components/modals/OrderPayment';
import { useFetchPayments } from '@/hooks/payments/payment.hooks';
import { KpayPaymentStatus, PaymentType } from '@/types/payment.types';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { ORDER_FEE_RANGES } from '@/constants/order.constants';

const SkeletonLine = ({ className = '' }: { className?: string }) => (
  <span className={`inline-block animate-pulse rounded bg-slate-100 ${className}`} />
);

const PublicOrderDetails = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  useDocumentTitle('Order Details');

  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('pods-visible');
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );
    }

    document.querySelectorAll('.pods-reveal:not(.pods-visible)').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  });

  const dispatch = useAppDispatch();
  const { order } = useAppSelector((state) => state.order);
  const { paymentsList } = useAppSelector((state) => state.payment);
  const { user: authUser } = useAppSelector((state) => state.auth);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState(false);
  const [defaultLocationPrompt, setDefaultLocationPrompt] = useState<'user' | 'org' | 'both' | null>(null);
  const hasAppliedDefault = useRef(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const orderId = id as UUID | undefined;
  const currentOrder = order?.id === orderId ? order : undefined;

  const { fetchPayments } = useFetchPayments();

  useEffect(() => {
    if (currentOrder?.id) {
      fetchPayments({ entityId: currentOrder.id, paymentType: PaymentType.ORDER });
    }
  }, [fetchPayments, currentOrder?.id]);

  const { getOrder } = useGetOrder();
  const { updateOrder } = useUpdateOrder();
  const { getOrderFee, orderFee } = useGetOrderFees(
    currentOrder?.finalFee !== null && currentOrder?.finalFee !== undefined ? currentOrder.finalFee : undefined,
    orderId
  );

  const {
    createOrderAssignment,
    isSuccess: createOrderAssignmentIsSuccess,
    isLoading: createOrderAssignmentIsLoading,
  } = useCreateOrderAssignment();

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
      updateOrder({
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
  }, [currentOrder?.id, updateOrder]);

  useLayoutEffect(() => {
    if (order?.id !== orderId) {
      dispatch(setOrder(undefined));
      setDistance(null);
      setEstimatedTime(null);
      hasAppliedDefault.current = false;
      setDefaultLocationPrompt(null);
    }
  }, [dispatch, order?.id, orderId]);

  useEffect(() => {
    if (orderId) {
      getOrder({ id: orderId });
    }
  }, [orderId, getOrder]);

  const userDefaultLat = authUser?.defaultLocation?.latitude ?? null;
  const userDefaultLng = authUser?.defaultLocation?.longitude ?? null;
  const orgDefaultLat = authUser?.organizationMembership?.[0]?.organization?.defaultLocation?.latitude ?? null;
  const orgDefaultLng = authUser?.organizationMembership?.[0]?.organization?.defaultLocation?.longitude ?? null;
  const userDefault =
    userDefaultLat !== null && userDefaultLng !== null
      ? { latitude: userDefaultLat, longitude: userDefaultLng }
      : null;
  const orgDefault =
    orgDefaultLat !== null && orgDefaultLng !== null
      ? { latitude: orgDefaultLat, longitude: orgDefaultLng }
      : null;

  useEffect(() => {
    if (!currentOrder?.id || currentOrder.locationFrom || hasAppliedDefault.current) return;

    if (userDefaultLat !== null && orgDefaultLat !== null) {
      setDefaultLocationPrompt('both');
    } else if (userDefaultLat !== null && userDefaultLng !== null) {
      hasAppliedDefault.current = true;
      updateOrder({
        id: currentOrder.id,
        order: { locationFrom: { latitude: userDefaultLat, longitude: userDefaultLng } },
      });
    } else if (orgDefaultLat !== null && orgDefaultLng !== null) {
      hasAppliedDefault.current = true;
      updateOrder({
        id: currentOrder.id,
        order: { locationFrom: { latitude: orgDefaultLat, longitude: orgDefaultLng } },
      });
    }
  }, [
    currentOrder?.id,
    currentOrder?.locationFrom,
    userDefaultLat,
    userDefaultLng,
    orgDefaultLat,
    orgDefaultLng,
    updateOrder,
  ]);

  const handleApplyDefault = (choice: 'user' | 'org' | 'skip') => {
    setDefaultLocationPrompt(null);
    hasAppliedDefault.current = true;
    if (choice === 'skip' || !currentOrder?.id) return;
    const loc = choice === 'user' ? userDefault : orgDefault;
    if (loc) {
      updateOrder({ id: currentOrder.id, order: { locationFrom: { latitude: loc.latitude, longitude: loc.longitude } } });
    }
  };

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
      updateOrder({
        id: currentOrder.id,
        order: {
          finalFee: orderFee,
        },
      });
    }
  }, [currentOrder?.id, orderFee, updateOrder]);

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

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .pods-reveal {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
          }
          .pods-reveal.pods-visible {
            opacity: 1;
            transform: translateY(0);
          }
        `,
        }}
      />

      <APIProvider apiKey={ENVIRONMENTS.GOOGLE_MAPS_API_KEY}>
        {currentOrder?.locationFrom && currentOrder?.locationTo && (
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
        )}

        <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-5xl">
            <header className="pods-reveal mb-8 rounded-xl border border-slate-200 p-6 text-center sm:p-8">
              <p className="mb-2 text-xs uppercase tracking-widest text-primary">Order details</p>
              <h1 className="mb-2 text-xl text-slate-900 sm:text-2xl">Confirm your route</h1>
              <p className="text-sm text-slate-500">
                We&apos;re almost ready. Review your pickup and delivery locations before payment or tracking.
              </p>
            </header>

            {defaultLocationPrompt === 'both' && (
              <section className="pods-reveal mb-5 rounded-xl border border-primary/15 bg-primary/5 p-5">
                <p className="mb-3 text-sm text-slate-700">
                  You have a saved pickup location. Choose which default you want to use.
                </p>
                <nav aria-label="Default pickup options" className="flex flex-wrap gap-2">
                  <Button onClick={() => handleApplyDefault('user')} className="py-1.5! px-4! text-xs" primary>
                    My Default Location
                  </Button>
                  <Button onClick={() => handleApplyDefault('org')} className="py-1.5! px-4! text-xs">
                    Organization Location
                  </Button>
                  <Button onClick={() => handleApplyDefault('skip')} className="py-1.5! px-4! text-xs text-slate-500!">
                    Set Manually
                  </Button>
                </nav>
              </section>
            )}

            <div className="space-y-5">
              {/* Locations — pickup and destination side by side */}
              <article className="pods-reveal rounded-xl border border-slate-200 p-5 sm:p-6">
                <header className="mb-5 border-b border-slate-100 pb-4">
                  <p className="mb-1 text-xs uppercase tracking-widest text-slate-600">Locations</p>
                  <h2 className="text-sm text-slate-700">Pickup and destination</h2>
                </header>

                <section className="grid gap-4 sm:grid-cols-2">
                  <article className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <header className="mb-3 flex items-start justify-between gap-3">
                      <p className="text-xs uppercase tracking-widest text-slate-600">Pickup</p>
                      {!currentOrder?.locationFrom ? (
                        <nav aria-label="Pickup actions" className="flex flex-wrap justify-end gap-2">
                          <Button
                            onClick={handleGetCurrentLocation}
                            isLoading={gettingCurrentLocation}
                            className="py-1! px-3! text-xs cursor-pointer"
                            primary
                          >
                            Use Current
                          </Button>
                          <Button
                            onClick={() => dispatch(setUpdateOrderLocationFromModal(true))}
                            className="py-1! px-3! text-xs cursor-pointer"
                          >
                            Set Location
                          </Button>
                        </nav>
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
                      <section className="space-y-3">
                        <AdministrativeLocation location={currentOrder.locationFrom} />
                      </section>
                    ) : (
                      <section className="rounded-md border border-dashed border-slate-200 bg-white p-4 text-center">
                        <p className="mb-2 text-sm text-slate-600">No pickup location set</p>
                        <p className="text-xs text-slate-500">
                          Use your current position or select a pickup point manually.
                        </p>
                      </section>
                    )}
                  </article>

                  <article className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <header className="mb-3 flex items-start justify-between gap-3">
                      <p className="text-xs uppercase tracking-widest text-slate-600">Destination</p>
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
                      <section className="space-y-3">
                        <AdministrativeLocation location={currentOrder.locationTo} />
                      </section>
                    ) : (
                      <section className="rounded-md border border-dashed border-slate-200 bg-white p-4 text-center">
                        <p className="mb-2 text-sm text-slate-600">No destination set</p>
                        <p className="text-xs text-slate-500">
                          Choose where your package should be delivered.
                        </p>
                      </section>
                    )}
                  </article>
                </section>
              </article>

              {/* Route information — shown once both locations are set */}
              {currentOrder?.locationFrom && currentOrder?.locationTo && (
                <article className="pods-reveal rounded-xl border border-slate-200 p-5 sm:p-6">
                  <header className="mb-5 border-b border-slate-100 pb-4">
                    <p className="mb-1 text-xs uppercase tracking-widest text-slate-600">Route information</p>
                    <h2 className="text-sm text-slate-700">Calculated delivery overview</h2>
                  </header>

                  {distance === null || estimatedTime === null ? (
                    <section className="grid gap-4 md:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <article key={i} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                          <SkeletonLine className="h-3 w-20" />
                          <SkeletonLine className="h-7 w-28" />
                          <SkeletonLine className="h-3 w-16" />
                        </article>
                      ))}
                    </section>
                  ) : (
                    <>
                      <section className="grid gap-4 md:grid-cols-3">
                        <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                          <p className="mb-1 text-xs uppercase tracking-widest text-slate-600">Distance</p>
                          <p className="text-2xl text-slate-900">{distance.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">kilometers</p>
                        </article>

                        <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                          <p className="mb-1 text-xs uppercase tracking-widest text-slate-600">Delivery time</p>
                          <p className="text-2xl text-slate-900">{renderDeliveryTime()}</p>
                          <p className="text-xs text-slate-500">{deliveryTimeUnit} • Two-wheeler</p>
                        </article>

                        <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                          <p className="mb-1 text-xs uppercase tracking-widest text-slate-600">Delivery fee</p>
                          {(orderFee !== undefined && orderFee > 0) ||
                          (currentOrder?.finalFee !== null &&
                            currentOrder?.finalFee !== undefined &&
                            currentOrder.finalFee > 0) ? (
                            <>
                              <p className="text-2xl text-slate-900">
                                {formatCurrency(orderFee ?? (currentOrder?.finalFee ?? 0))}
                              </p>
                              <p className="text-xs text-slate-500">including VAT</p>
                            </>
                          ) : (
                            <div className="space-y-3">
                              <SkeletonLine className="h-7 w-28" />
                              <SkeletonLine className="h-3 w-16" />
                            </div>
                          )}
                        </article>
                      </section>

                      <footer className="mt-5 rounded-lg border border-primary/15 bg-primary/5 p-4">
                        <p className="text-xs text-slate-600">
                          Route calculations use Google Maps. Delivery time includes a 15-minute operational buffer and
                          keeps a minimum 20-30 minute estimate.
                        </p>

                        {((orderFee !== undefined && orderFee > 0) ||
                          (currentOrder?.finalFee !== null &&
                            currentOrder?.finalFee !== undefined &&
                            currentOrder.finalFee > 0)) && (
                          <p className="mt-3 text-xs text-slate-600">
                            The fee is based on distance between locations.
                            {' '}
                            <Link
                              to="/about/orders/fees"
                              className="text-primary underline underline-offset-2 hover:text-primary-600"
                            >
                              View fee breakdown
                            </Link>
                          </p>
                        )}

                        <details className="mt-3 text-xs text-slate-600">
                          <summary className="cursor-pointer text-slate-700">Fee ranges (RWF)</summary>
                          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {ORDER_FEE_RANGES.map((range) => {
                              const label =
                                range.max === Infinity
                                  ? `${Math.floor(range.min)} km+ (outside Kigali)`
                                  : `${range.min}-${range.max} km`;
                              return (
                                <li
                                  key={`${range.min}-${range.max}`}
                                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
                                >
                                  <span>{label}</span>
                                  <span className="text-slate-800">{formatCurrency(range.fee)}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </details>
                      </footer>
                    </>
                  )}
                </article>
              )}

              {/* Next step + Continue — side by side below locations */}
              <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
                <article className="pods-reveal rounded-xl border border-primary/15 bg-primary/5 p-5 sm:p-6">
                  <header className="mb-4 border-b border-primary/10 pb-4">
                    <p className="mb-1 text-xs uppercase tracking-widest text-primary">Next step</p>
                    <h2 className="text-sm text-slate-700">Payment and assignment</h2>
                  </header>

                  <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white">
                        1
                      </span>
                      <p className="text-sm text-slate-600">Confirm both locations to unlock payment.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white">
                        2
                      </span>
                      <p className="text-sm text-slate-600">After payment, the order moves into rider assignment.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white">
                        3
                      </span>
                      <p className="text-sm text-slate-600">Once assigned, tracking becomes available immediately.</p>
                    </li>
                  </ol>
                </article>

                <footer className="pods-reveal rounded-xl border border-slate-200 p-5 sm:p-6">
                  <p className="mb-4 text-xs uppercase tracking-widest text-slate-600">Continue</p>
                  {paymentsList?.some((payment) => payment.status === KpayPaymentStatus.SUCCESSFUL) ? (
                    <Button
                      primary
                      isLoading={createOrderAssignmentIsLoading}
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentOrder?.id) {
                          createOrderAssignment({
                            orderId: currentOrder.id,
                          });
                        }
                      }}
                      className="w-full cursor-pointer"
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
                      className="w-full cursor-pointer"
                    >
                      {!currentOrder?.locationFrom || !currentOrder?.locationTo
                        ? 'Set Both Locations to Continue'
                        : 'Complete Payment'}
                    </Button>
                  )}
                </footer>
              </section>
            </div>

            <UpdateOrderLocationFrom />
            <UpdateOrderLocationTo />
            <OrderPayment />
          </div>
        </main>
      </APIProvider>
    </>
  );
};

export default PublicOrderDetails;
