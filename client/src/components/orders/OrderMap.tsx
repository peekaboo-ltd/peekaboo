import React, { useMemo } from 'react';
import {
  APIProvider,
  Map,
  Marker,
  useMap,
} from '@vis.gl/react-google-maps';
import type { Order } from '../../types/order.type';
import { ENVIRONMENTS } from '../../constants/environments.constants';
import { useI18n } from '@/i18n/i18n';

interface OrderMapProps {
  order: Order;
  riderLocation?: { lat: number; lng: number };
}

export const OrderMap: React.FC<OrderMapProps> = ({ order, riderLocation }) => {
  const { t } = useI18n();
  const mapCenter = useMemo(() => {
    if (order.locationFrom?.latitude && order.locationFrom?.longitude) {
      return {
        lat: order.locationFrom.latitude,
        lng: order.locationFrom.longitude,
      };
    } else if (order.locationTo?.latitude && order.locationTo?.longitude) {
      return {
        lat: order.locationTo.latitude,
        lng: order.locationTo.longitude,
      };
    }
    // Default to a central location if no coordinates
    return { lat: 0, lng: 0 };
  }, [order]);

  const hasValidCoordinates = 
    (order.locationFrom?.latitude && order.locationFrom?.longitude) ||
    (order.locationTo?.latitude && order.locationTo?.longitude);

  if (!hasValidCoordinates) {
    return (
      <div className="flex items-center justify-center h-96 bg-(--surface) rounded-lg">
        <p className="text-muted-foreground">{t('order.map.noCoordinates')}</p>
      </div>
    );
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden">
      <APIProvider apiKey={ENVIRONMENTS.GOOGLE_MAPS_API_KEY || ''}>
        <Map
          defaultCenter={mapCenter}
          defaultZoom={12}
          mapId="order-details-map"
          disableDefaultUI={false}
        >
          {/* Pickup Location Marker */}
          {order.locationFrom?.latitude && order.locationFrom?.longitude && (
            <Marker
              position={{
                lat: order.locationFrom.latitude,
                lng: order.locationFrom.longitude,
              }}
              title={t('order.map.pickup')}
            />
          )}

          {/* Delivery Location Marker */}
          {order.locationTo?.latitude && order.locationTo?.longitude && (
            <Marker
              position={{
                lat: order.locationTo.latitude,
                lng: order.locationTo.longitude,
              }}
              title={t('order.map.delivery')}
            />
          )}

          {/* Rider Location Marker */}
          {riderLocation && (
            <Marker
              position={riderLocation}
              title={t('order.map.rider')}
            />
          )}

          {/* Route Line */}
          {order.locationFrom?.latitude && 
           order.locationFrom?.longitude && 
           order.locationTo?.latitude && 
           order.locationTo?.longitude && (
            <DirectionsRenderer
              origin={{
                lat: order.locationFrom.latitude,
                lng: order.locationFrom.longitude,
              }}
              destination={{
                lat: order.locationTo.latitude,
                lng: order.locationTo.longitude,
              }}
            />
          )}
        </Map>
      </APIProvider>
    </div>
  );
};

// Directions Renderer Component
const DirectionsRenderer: React.FC<{
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}> = ({ origin, destination }) => {
  const map = useMap();

  React.useEffect(() => {
    if (!map) return;

    const ink = getComputedStyle(document.documentElement)
      .getPropertyValue('--ink')
      .trim();

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: ink,
        strokeWeight: 4,
        strokeOpacity: 0.8,
      },
    });

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
        }
      }
    );

    return () => {
      directionsRenderer.setMap(null);
    };
  }, [map, origin, destination]);

  return null;
};
