import React, { useEffect, useMemo, useState } from 'react';
import type { Order } from '../../types/order.type';
import { BaseMap, MapLine, MapPin, MapViewport, type LatLng } from '@/components/maps/mapGl';
import { fetchDrivingRoute } from '@/utils/routing.util';
import { useI18n } from '@/i18n/i18n';

interface OrderMapProps {
  order: Order;
  riderLocation?: { lat: number; lng: number };
}

const toPosition = (location?: { latitude?: number | null; longitude?: number | null } | null) =>
  location?.latitude && location?.longitude
    ? { lat: location.latitude, lng: location.longitude }
    : null;

export const OrderMap: React.FC<OrderMapProps> = ({ order, riderLocation }) => {
  const { t } = useI18n();
  const pickupLat = order.locationFrom?.latitude;
  const pickupLng = order.locationFrom?.longitude;
  const dropoffLat = order.locationTo?.latitude;
  const dropoffLng = order.locationTo?.longitude;

  const pickup = useMemo(
    () => toPosition({ latitude: pickupLat, longitude: pickupLng }),
    [pickupLat, pickupLng],
  );
  const dropoff = useMemo(
    () => toPosition({ latitude: dropoffLat, longitude: dropoffLng }),
    [dropoffLat, dropoffLng],
  );
  const positions = useMemo(
    () => [pickup, dropoff].filter((position): position is LatLng => position !== null),
    [pickup, dropoff],
  );

  if (!positions.length) {
    return (
      <div className="flex items-center justify-center h-96 bg-(--surface) rounded-lg">
        <p className="text-muted-foreground">{t('order.map.noCoordinates')}</p>
      </div>
    );
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden">
      <BaseMap initialCenter={positions[0]} initialZoom={12}>
        <MapViewport positions={positions} emptyCenter={positions[0]} emptyZoom={12} />

        {pickup && dropoff ? <RouteLine origin={pickup} destination={dropoff} /> : null}

        {pickup ? (
          <MapPin
            position={pickup}
            title={t('order.map.pickup')}
            background="var(--paper)"
            borderColor="var(--ink)"
            glyphColor="var(--ink)"
          />
        ) : null}

        {dropoff ? (
          <MapPin
            position={dropoff}
            title={t('order.map.delivery')}
            background="var(--ink)"
            borderColor="var(--ink)"
            glyphColor="var(--paper)"
          />
        ) : null}

        {riderLocation ? (
          <MapPin
            position={riderLocation}
            title={t('order.map.rider')}
            background="var(--chart-3)"
            borderColor="var(--ink)"
            glyphColor="var(--paper)"
          />
        ) : null}
      </BaseMap>
    </div>
  );
};

/** Road route when a routing service is configured; a dashed straight line otherwise. */
const RouteLine: React.FC<{ origin: LatLng; destination: LatLng }> = ({
  origin,
  destination,
}) => {
  const [route, setRoute] = useState<{ path: LatLng[]; isRoadRoute: boolean } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchDrivingRoute(origin, destination, controller.signal)
      .then(setRoute)
      .catch(() => undefined);
    return () => controller.abort();
  }, [origin, destination]);

  const path = route?.path ?? [origin, destination];
  return (
    <MapLine
      path={path}
      color="var(--ink)"
      width={4}
      dashed={!route?.isRoadRoute}
    />
  );
};
