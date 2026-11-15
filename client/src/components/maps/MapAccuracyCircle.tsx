import { MapCircle, type LatLng } from './mapGl';

interface MapAccuracyCircleProps {
  center: LatLng;
  radiusMeters: number;
  fillColor?: string;
  strokeColor?: string;
}

const MapAccuracyCircle = ({
  center,
  radiusMeters,
  fillColor = '#6ba3c7',
  strokeColor = '#6ba3c7',
}: MapAccuracyCircleProps) => (
  <MapCircle
    center={center}
    radiusMeters={radiusMeters}
    fillColor={fillColor}
    strokeColor={strokeColor}
  />
);

export default MapAccuracyCircle;
