import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface MapAccuracyCircleProps {
  center: google.maps.LatLngLiteral;
  radiusMeters: number;
  fillColor?: string;
  strokeColor?: string;
}

const MapAccuracyCircle = ({
  center,
  radiusMeters,
  fillColor = '#6ba3c7',
  strokeColor = '#6ba3c7',
}: MapAccuracyCircleProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const resolvedFill =
      fillColor.startsWith('var(') && typeof document !== 'undefined'
        ? getComputedStyle(document.documentElement)
            .getPropertyValue(fillColor.slice(4, -1))
            .trim() || '#6ba3c7'
        : fillColor;
    const resolvedStroke =
      strokeColor.startsWith('var(') && typeof document !== 'undefined'
        ? getComputedStyle(document.documentElement)
            .getPropertyValue(strokeColor.slice(4, -1))
            .trim() || '#6ba3c7'
        : strokeColor;

    const circle = new google.maps.Circle({
      map,
      center,
      radius: radiusMeters,
      fillColor: resolvedFill,
      fillOpacity: 0.14,
      strokeColor: resolvedStroke,
      strokeOpacity: 0.45,
      strokeWeight: 1.5,
    });

    return () => {
      circle.setMap(null);
    };
  }, [center, fillColor, map, radiusMeters, strokeColor]);

  return null;
};

export default MapAccuracyCircle;
