import { useGetOrder, useGetOrderFees, useUpdateOrder } from '@/hooks/orders/orders.hooks';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setOrder, setOrderPaymentModal, setSelectedOrder, setUpdateOrderLocationFromModal, setUpdateOrderLocationToModal } from '@/states/slices/order.slice';
import type { UUID } from '@/types';
import { getCurrentLocation } from '@/utils/locations.util';
import { useCallback, useEffect, useState, useRef } from 'react';
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

const PublicOrderDetails = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const { order } = useAppSelector((state) => state.order);
  const { paymentsList } = useAppSelector((state) => state.payment);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState(false);

  // FETCH PAYMENTS
  const { fetchPayments } = useFetchPayments();

  useEffect(() => {
    if (order?.id) {
      fetchPayments({ entityId: order?.id, paymentType: PaymentType.ORDER });
    }
  }, [fetchPayments, order?.id]);

  // NAVIGATION
  const { id } = useParams();
  const navigate = useNavigate();

  /**
   * HOOKS
   */

  // ORDER HOOKS
  const { getOrder } = useGetOrder();
  const { updateOrder } = useUpdateOrder();
  const { getOrderFee, orderFee } = useGetOrderFees(
    order?.finalFee !== null && order?.finalFee !== undefined ? order.finalFee : undefined
  );

  // CREATE ORDER ASSIGNMENT HOOKS
  const {
    createOrderAssignment,
    isSuccess: createOrderAssignmentIsSuccess,
    isLoading: createOrderAssignmentIsLoading,
  } = useCreateOrderAssignment();

  useEffect(() => {
    if (createOrderAssignmentIsSuccess) {
      navigate(`/p/orders/${order?.id}/tracking`);
    }
  }, [createOrderAssignmentIsSuccess, navigate, order?.id]);

  // HANDLE CURRENT LOCATION
  const handleGetCurrentLocation = useCallback(async () => {
    if (!order?.id) return;

    setGettingCurrentLocation(true);
    try {
      const location = await getCurrentLocation();
      updateOrder({
        id: order.id,
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
  }, [order?.id, updateOrder]);

  // Reset stale data when order ID changes
  useEffect(() => {
    dispatch(setOrder(undefined));
    setDistance(null);
    setEstimatedTime(null);
    if (id) {
      getOrder({ id: id as UUID });
    }
  }, [id, getOrder, dispatch]);

  const handleRouteCalculated = (
    calculatedDistance: number,
    calculatedTime: number
  ) => {
    setDistance(calculatedDistance);
    setEstimatedTime(calculatedTime);
  };

  useEffect(() => {
    if (distance !== null && distance > 0) {
      getOrderFee(distance);
    }
  }, [distance, getOrderFee]);

  useEffect(() => {
    if (orderFee && order?.id) {
      updateOrder({
        id: order?.id,
        order: {
          finalFee: orderFee,
        },
      });
    }
  }, [order?.id, orderFee, updateOrder]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .animate-fade-in-up {
            animation: fadeInUp 1.2s ease-out forwards;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-on-scroll {
            opacity: 0;
            transform: translateY(50px);
            transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          }

          html {
            scroll-behavior: smooth;
          }
        `,
        }}
      />

      <APIProvider apiKey={ENVIRONMENTS.GOOGLE_MAPS_API_KEY}>
        {order?.locationFrom && order?.locationTo && (
          <RouteCalculator
            locationFrom={{
              latitude: order.locationFrom.latitude ?? 0,
              longitude: order.locationFrom.longitude ?? 0,
            }}
            locationTo={{
              latitude: order.locationTo.latitude ?? 0,
              longitude: order.locationTo.longitude ?? 0,
            }}
            onRouteCalculated={handleRouteCalculated}
          />
        )}
        <main className="w-full flex flex-col gap-8 max-w-6xl mx-auto self-center px-4 py-8">
          <header className="text-center mb-8 animate-on-scroll">
            <h1 className="text-xl uppercase sm:text-xl lg:text-2xl font-bold text-black mb-2 px-2">
              Order Details
            </h1>{' '}
            <p className="text-gray-600">
              We're almost ready! Please confirm your pickup and delivery
              locations.
            </p>
          </header>
          <section className="w-full flex flex-col gap-6">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article className="bg-white rounded-sm shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 animate-on-scroll">
                <header className="flex items-center justify-between mb-4">
                  <header className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Pickup Location
                    </h3>
                  </header>
                  {!order?.locationFrom && (
                    <nav className="flex gap-2">
                      <Button
                        onClick={handleGetCurrentLocation}
                        isLoading={gettingCurrentLocation}
                        className="py-1! px-3! text-xs cursor-pointer"
                        primary
                      >
                        Use Current
                      </Button>
                      <Button
                        onClick={() =>
                          dispatch(setUpdateOrderLocationFromModal(true))
                        }
                        className="py-1! px-3! text-xs cursor-pointer"
                      >
                        Set Location
                      </Button>
                    </nav>
                  )}
                  {order?.locationFrom && (
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="w-4 h-4 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(setUpdateOrderLocationFromModal(true));
                      }}
                    />
                  )}
                </header>
                {order?.locationFrom ? (
                  <section className="space-y-2">
                    <AdministrativeLocation location={order?.locationFrom} />
                  </section>
                ) : (
                  <section className="text-center py-4">
                    <p className="text-gray-500 text-sm mb-3">
                      No pickup location set
                    </p>
                    <p className="text-xs text-gray-400">
                      Click "Use Current" to use your location or "Set Location"
                      to choose manually
                    </p>
                  </section>
                )}
              </article>
              <article className="bg-white rounded-sm shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 animate-on-scroll">
                <header className="flex items-center justify-between mb-4">
                  <header className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Delivery Destination
                    </h3>
                  </header>
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    className="w-4 h-4 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(setUpdateOrderLocationToModal(true));
                    }}
                  />
                </header>
                {order?.locationTo ? (
                  <section className="space-y-2">
                    <AdministrativeLocation location={order?.locationTo} />
                  </section>
                ) : (
                  <section className="text-center py-4">
                    <p className="text-gray-500 text-sm mb-3">
                      No destination set
                    </p>
                    <p className="text-xs text-gray-400">
                      Click "Set Destination" to choose where your package should
                      be delivered
                    </p>
                  </section>
                )}
              </article>
            </section>
            {distance !== null && estimatedTime !== null && (
              <section className="bg-gray-100 rounded-sm p-6 border border-gray-300">
                <header className="mb-6">
                  <header className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Route Information
                    </h3>
                  </header>
                  <p className="text-sm text-gray-600">
                    Calculated route details for your delivery
                  </p>
                </header>
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <article className="bg-white rounded-sm p-6 shadow-sm hover:shadow-md transition-shadow">
                    <header className="flex items-center gap-3 mb-3">
                      <header>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Distance
                        </h4>
                        <p className="text-xs text-gray-500">
                          Total route distance
                        </p>
                      </header>
                    </header>
                    <p className="text-3xl font-bold text-black mb-1">
                      {distance.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">kilometers</p>
                  </article>
                  <article className="bg-white rounded-sm p-6 shadow-sm hover:shadow-md transition-shadow">
                    <header className="flex items-center gap-3 mb-3">
                      <header>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Delivery Time
                        </h4>
                        <p className="text-xs text-gray-500">
                          Estimated duration
                        </p>
                      </header>
                    </header>
                    <p className="text-3xl font-bold text-gray-700 mb-1">
                      {(() => {
                        // Calculate delivery time range with +15 minutes buffer
                        // Minimum delivery time range is 20-30 minutes
                        const calculatedBaseTime = Math.round(estimatedTime);
                        const calculatedBufferTime = calculatedBaseTime + 15;

                        // Apply minimum range of 20-30 minutes
                        const baseTime = calculatedBaseTime < 20 ? 20 : calculatedBaseTime;
                        const bufferTime = calculatedBufferTime < 30 ? 30 : calculatedBufferTime;

                        if (bufferTime < 60) {
                          // Both times under 60 minutes
                          return `${baseTime}–${bufferTime}`;
                        } else if (baseTime < 60) {
                          // Base time under 60, buffer over 60
                          const bufferHours = Math.floor(bufferTime / 60);
                          const bufferMins = bufferTime % 60;
                          return `${baseTime} min – ${bufferHours}:${String(bufferMins).padStart(2, '0')} hr`;
                        } else {
                          // Both times over 60 minutes
                          const baseHours = Math.floor(baseTime / 60);
                          const baseMins = baseTime % 60;
                          const bufferHours = Math.floor(bufferTime / 60);
                          const bufferMins = bufferTime % 60;
                          return `${baseHours}:${String(baseMins).padStart(2, '0')} – ${bufferHours}:${String(bufferMins).padStart(2, '0')}`;
                        }
                      })()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(() => {
                        const calculatedBufferTime = Math.round(estimatedTime) + 15;
                        const bufferTime = calculatedBufferTime < 30 ? 30 : calculatedBufferTime;
                        return bufferTime < 60 ? 'minutes' : 'hours';
                      })()} • Two-wheeler
                    </p>
                  </article>
                  <article className="bg-white rounded-sm p-6 shadow-sm hover:shadow-md transition-shadow">
                    <header className="flex items-center gap-3 mb-3">
                      <header>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Delivery Fee
                        </h4>
                        <p className="text-xs text-gray-500">Estimated cost</p>
                      </header>
                    </header>
                    <section className='flex items-center gap-2'>
                      {(orderFee !== undefined && orderFee > 0) || (order?.finalFee !== null && order?.finalFee !== undefined && order.finalFee > 0) ? (
                        <section>
                          <p className="text-3xl font-bold text-black mb-1">
                            {formatCurrency(orderFee ?? (order?.finalFee ?? 0))}
                          </p>
                          <p className="text-sm text-gray-500">including VAT</p>
                        </section>
                      ) : (
                        <section className="flex items-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></span>
                          <p className="text-lg text-gray-500">Calculating...</p>
                        </section>
                      )}
                    </section>
                  </article>
                </dl>
                <footer className="mt-6 pt-4 border-t border-gray-300">
                  <p className="text-xs text-gray-600 mb-2">
                    * Route calculated using Google Maps. Delivery time includes a +15 minute buffer for unexpected circumstances. Minimum delivery time is 20–30 minutes.
                  </p>
                  {((orderFee !== undefined && orderFee > 0) || (order?.finalFee !== null && order?.finalFee !== undefined && order?.finalFee > 0)) && (
                    <p className="text-xs text-gray-700">
                      ** The fee is based on distance between locations.{' '} {order?.finalFee !== undefined && order?.finalFee !== null && order?.finalFee > 0 ? 'Final fee: ' + formatCurrency(order?.finalFee ?? 0) : ''} {orderFee !== undefined && orderFee > 0 ? 'Order fee: ' + formatCurrency(orderFee ?? 0) : ''}. {' '}
                      <Link
                        to="/about/orders/fees"
                        className="text-primary text-[11px] underline underline-offset-2 hover:text-primary-600"
                      >
                        View fee breakdown
                      </Link>
                    </p>
                  )}
                </footer>
              </section>
            )}
          </section>
          <footer className="mt-8 flex justify-end animate-on-scroll">
            {paymentsList?.filter((payment) => payment.status === KpayPaymentStatus.SUCCESSFUL).length > 0 ? (
              <Button
                primary
                isLoading={createOrderAssignmentIsLoading}
                onClick={(e) => {
                  e.preventDefault();
                  if (order?.id) {
                    createOrderAssignment({
                      orderId: order?.id,
                    });
                  }
                }}
                className="px-8! py-3! font-semibold cursor-pointer"
              >
                Track Order
              </Button>
            ) : (
              <Button
                primary
                disabled={!order?.locationFrom || !order?.locationTo}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setSelectedOrder(order));
                  dispatch(setOrderPaymentModal(true));
                }}
                className="px-8! py-3! font-semibold cursor-pointer"
              >
                {!order?.locationFrom || !order?.locationTo
                  ? 'Set Both Locations to Continue'
                  : 'Complete Payment'}
              </Button>
            )}
          </footer>

          {/* Modal Components */}
          <UpdateOrderLocationFrom />
          <UpdateOrderLocationTo />
          <OrderPayment />
        </main>
      </APIProvider>
    </>
  );
};

export default PublicOrderDetails;
