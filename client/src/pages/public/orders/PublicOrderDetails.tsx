import PlaceSearch from '@/components/inputs/PlaceSearch';
import { useGetOrder, useUpdateOrder } from '@/hooks/orders/orders.hooks';
import { useAppSelector } from '@/states/hooks';
import type { UUID } from '@/types';
import { getCurrentLocation } from '@/utils/locations.util';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import RouteCalculator from '@/containers/locations/RouteCalculator';
import AdministrativeLocation from '@/containers/locations/AdministrativeLocation';
import { useCreateOrderAssignment } from '@/hooks/orders/orderAssignments.hooks';
import Button from '@/components/inputs/Button';

const PublicOrderDetails = () => {
  // STATE VARIABLES
  const { order } = useAppSelector((state) => state.order);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  // NAVIGATION
  const { id } = useParams();
  const navigate = useNavigate();

  /**
   * HOOKS
   */

  // ORDER HOOKS
  const { getOrder } = useGetOrder();
  const { updateOrder } = useUpdateOrder();

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

  // GET CURRENT LOCATION
  useEffect(() => {
    getCurrentLocation().then((location) => {
      if (order?.id) {
        updateOrder({
          id: order?.id,
          order: {
            locationFrom: {
              latitude: location?.latitude,
              longitude: location?.longitude,
            },
          },
        });
      }
    });
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
      <main className="w-full flex flex-col gap-4 min-h-screen max-w-[80vw] mx-auto self-center py-16">
        <nav className="w-full flex flex-col gap-4">
          <h2 className="text-center">We are almost there!</h2>
        </nav>
        <form className="w-full flex flex-col gap-4">
          <PlaceSearch
            onLocationSelect={(location) => {
              if (location) {
                if (order?.id) {
                  updateOrder({
                    id: order?.id,
                    order: {
                      locationTo: {
                        latitude: location?.coordinates?.latitude,
                        longitude: location?.coordinates?.longitude,
                      },
                    },
                  });
                }
              }
            }}
          />
        </form>
        <section className="w-full flex flex-col gap-6">
          <menu className="grid grid-cols-2 gap-6">
            <li className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-start border border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wide">
                Location From
              </span>
              <ul className="flex flex-col gap-2">
                <AdministrativeLocation location={order?.locationFrom} />
              </ul>
            </li>
            <li className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-start border border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wide">
                Location To
              </span>
              <ul className="flex flex-col gap-2">
                <AdministrativeLocation location={order?.locationTo} />
              </ul>
            </li>
          </menu>
          {distance !== null && estimatedTime !== null && (
            <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-sans">
                Route Information
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <article className="flex items-center gap-3">
                  <span className="text-green-600" aria-hidden="true">
                    📏
                  </span>
                  <section>
                    <dt className="text-sm text-gray-700 font-medium font-sans">
                      Distance
                    </dt>
                    <dd className="text-lg font-bold text-gray-900 font-sans">
                      {distance.toFixed(2)} km
                    </dd>
                  </section>
                </article>
                <article className="flex items-center gap-3">
                  <span className="text-orange-600" aria-hidden="true">
                    🏍️
                  </span>
                  <section>
                    <dt className="text-sm text-gray-700 font-medium font-sans">
                      Estimated Time (Two-wheeler)
                    </dt>
                    <dd className="text-lg font-bold text-gray-900 font-sans">
                      {estimatedTime < 60
                        ? `${Math.round(estimatedTime)} min`
                        : `${Math.floor(estimatedTime / 60)}h ${Math.round(
                            estimatedTime % 60
                          )}m`}
                    </dd>
                  </section>
                </article>
              </dl>
              <p className="text-xs text-gray-600 mt-3 font-sans">
                * Route calculated using Google Maps. Two-wheeler time is 15%
                faster than driving due to better traffic navigation.
              </p>
            </section>
          )}
        </section>
        <Button primary isLoading={createOrderAssignmentIsLoading} onClick={(e) => {
          e.preventDefault();
          if (order?.id) {
          createOrderAssignment({
              orderId: order?.id,
            });
          }
        }}>
          Continue
        </Button>
      </main>
    </APIProvider>
  );
};

export default PublicOrderDetails;
