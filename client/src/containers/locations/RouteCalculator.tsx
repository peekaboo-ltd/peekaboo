import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';
import { estimateTwoWheelerTime } from '@/utils/locations.util';

const RouteCalculator = ({
  locationFrom,
  locationTo,
  onRouteCalculated,
}: {
  locationFrom: { latitude: number; longitude: number };
  locationTo: { latitude: number; longitude: number };
  onRouteCalculated: (distance: number, duration: number) => void;
}) => {
  const routesLibrary = useMapsLibrary('routes');

  useEffect(() => {
    if (!routesLibrary || !locationFrom || !locationTo) return;

    const directionsService = new routesLibrary.DirectionsService();

    directionsService
      .route({
        origin: { lat: locationFrom.latitude, lng: locationFrom.longitude },
        destination: { lat: locationTo.latitude, lng: locationTo.longitude },
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .then((response) => {
        const route = response.routes[0];
        if (route && route.legs[0]) {
          const leg = route.legs[0];
          const distanceInKm = leg.distance?.value
            ? leg.distance.value / 1000
            : 0;
          const durationInMinutes = leg.duration?.value
            ? leg.duration.value / 60
            : 0;

          // For two-wheeler, reduce time by ~15% as they can navigate traffic better
          const twoWheelerTime = Math.round(durationInMinutes * 0.85);

          onRouteCalculated(distanceInKm, twoWheelerTime);
        }
      })
      .catch((error) => {
        console.error('Error calculating route:', error);
        // Fallback: use straight-line distance and estimation
        if (locationFrom && locationTo) {
          const R = 6371;
          const dLat =
            ((locationTo.latitude - locationFrom.latitude) * Math.PI) / 180;
          const dLon =
            ((locationTo.longitude - locationFrom.longitude) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((locationFrom.latitude * Math.PI) / 180) *
              Math.cos((locationTo.latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          const estimatedTime = estimateTwoWheelerTime(distance);
          onRouteCalculated(distance, estimatedTime);
        }
      });
  }, [routesLibrary, locationFrom, locationTo, onRouteCalculated]);

  return null;
};

export default RouteCalculator;
