import { useGetOrder, useGetOrderFees, useUpdateOrder } from '@/hooks/orders/orders.hooks';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setUpdateOrderLocationFromModal, setUpdateOrderLocationToModal } from '@/states/slices/order.slice';
import type { UUID } from '@/types';
import { getCurrentLocation } from '@/utils/locations.util';
import { useCallback, useEffect, useState } from 'react';
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

const PublicOrderDetails = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const { order } = useAppSelector((state) => state.order);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState(false);

  // NAVIGATION
  const { id } = useParams();
  const navigate = useNavigate();

  /**
   * HOOKS
   */

  // ORDER HOOKS
  const { getOrder } = useGetOrder();
  const { updateOrder } = useUpdateOrder();
  const { getOrderFee, orderFee } = useGetOrderFees();

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

  useEffect(() => {
    if (id) {
      getOrder({ id: id as UUID });
    }
  }, [id, getOrder]);

  const handleRouteCalculated = (
    calculatedDistance: number,
    calculatedTime: number
  ) => {
    setDistance(calculatedDistance);
    setEstimatedTime(calculatedTime);
  };

  useEffect(() => {
    if (distance) {
      getOrderFee(distance);
    }
  }, [distance, getOrderFee]);

  return (
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
        <header className="text-center mb-8">
          <h1 className="text-xl uppercase sm:text-xl lg:text-2xl font-bold text-primary mb-2 px-2">
            Order Details
          </h1>{' '}
          <p className="text-gray-600">
            We're almost ready! Please confirm your pickup and delivery
            locations.
          </p>
        </header>
        <section className="w-full flex flex-col gap-6">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <article className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
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
                      className="!py-1 !px-3 !text-xs"
                      primary
                    >
                      Use Current
                    </Button>
                    <Button
                      onClick={() =>
                        dispatch(setUpdateOrderLocationFromModal(true))
                      }
                      className="!py-1 !px-3 !text-xs"
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
            <article className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
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
            <section className="bg-gray-100 rounded-xl p-6 border border-gray-300">
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
                <article className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
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
                  <p className="text-3xl font-bold text-primary mb-1">
                    {distance.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">kilometers</p>
                </article>
                <article className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
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
                    {estimatedTime < 60
                      ? Math.round(estimatedTime)
                      : `${Math.floor(estimatedTime / 60)}:${String(
                          Math.round(estimatedTime % 60)
                        ).padStart(2, '0')}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {estimatedTime < 60 ? 'minutes' : 'hours'} • Two-wheeler
                  </p>
                </article>
                <article className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <header className="flex items-center gap-3 mb-3">
                    <header>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Delivery Fee
                      </h4>
                      <p className="text-xs text-gray-500">Estimated cost</p>
                    </header>
                  </header>
                  <section>
                    {orderFee !== undefined && orderFee > 0 ? (
                      <section>
                        <p className="text-3xl font-bold text-primary mb-1">
                          {formatCurrency(orderFee)}
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
                  * Route calculated using Google Maps. Two-wheeler time is 15%
                  faster than driving due to better traffic navigation.
                </p>
                {orderFee !== undefined && orderFee > 0 && (
                  <p className="text-xs text-gray-700">
                    ** The fee is based on distance between locations.{' '}
                    <Link
                      to="/p/orders/fees"
                      className="text-primary text-sm underline hover:text-primary-600"
                    >
                      View fee breakdown
                    </Link>
                  </p>
                )}
              </footer>
            </section>
          )}
        </section>
        <footer className="mt-8 flex justify-end">
          <Button
            primary
            isLoading={createOrderAssignmentIsLoading}
            disabled={!order?.locationFrom || !order?.locationTo}
            onClick={(e) => {
              e.preventDefault();
              if (order?.id) {
                createOrderAssignment({
                  orderId: order?.id,
                });
              }
            }}
            className="!px-8 !py-3 font-semibold"
          >
            {!order?.locationFrom || !order?.locationTo
              ? 'Set Both Locations to Continue'
              : 'Track Order'}
          </Button>
        </footer>

        {/* Modal Components */}
        <UpdateOrderLocationFrom />
        <UpdateOrderLocationTo />
      </main>
    </APIProvider>
  );
};

export default PublicOrderDetails;
