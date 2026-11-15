import { useEffect, useRef } from 'react';
import { fetchDrivingRoute } from '@/utils/routing.util';

const RouteCalculator = ({
  locationFrom,
  locationTo,
  onRouteCalculated,
}: {
  locationFrom: { latitude: number; longitude: number };
  locationTo: { latitude: number; longitude: number };
  onRouteCalculated: (distance: number, duration: number) => void;
}) => {
  // Callers pass an inline callback; holding it in a ref keeps a re-render
  // from re-requesting the same route (each request is billable on Mapbox).
  const onRouteCalculatedRef = useRef(onRouteCalculated);
  useEffect(() => {
    onRouteCalculatedRef.current = onRouteCalculated;
  }, [onRouteCalculated]);

  const { latitude: fromLat, longitude: fromLng } = locationFrom ?? {};
  const { latitude: toLat, longitude: toLng } = locationTo ?? {};

  useEffect(() => {
    if (
      fromLat === undefined ||
      fromLng === undefined ||
      toLat === undefined ||
      toLng === undefined
    ) {
      return;
    }

    const controller = new AbortController();
    fetchDrivingRoute(
      { lat: fromLat, lng: fromLng },
      { lat: toLat, lng: toLng },
      controller.signal,
    )
      .then((route) =>
        onRouteCalculatedRef.current(route.distanceKm, route.durationMinutes),
      )
      .catch(() => undefined);

    return () => controller.abort();
  }, [fromLat, fromLng, toLat, toLng]);

  return null;
};

export default RouteCalculator;
