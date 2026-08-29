import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface HeroMapViewportProps {
  positions: google.maps.LatLngLiteral[];
  emptyCenter?: google.maps.LatLngLiteral;
  emptyZoom?: number;
}

const KIGALI_CENTER = { lat: -1.9441, lng: 30.0619 };

const HeroMapViewport = ({
  positions,
  emptyCenter = KIGALI_CENTER,
  emptyZoom = 12,
}: HeroMapViewportProps) => {
  const map = useMap();
  const coordinateKey = positions
    .map(({ lat, lng }) => `${lat},${lng}`)
    .join(';');
  const emptyCenterKey = `${emptyCenter.lat},${emptyCenter.lng}`;

  useEffect(() => {
    if (!map) return;

    const currentPositions = coordinateKey
      ? coordinateKey.split(';').map((coordinate) => {
          const [lat, lng] = coordinate.split(',').map(Number);
          return { lat, lng };
        })
      : [];

    if (currentPositions.length === 0) {
      const [lat, lng] = emptyCenterKey.split(',').map(Number);
      map.panTo({ lat, lng });
      map.setZoom(emptyZoom);
      return;
    }

    const distinctPositions = new Set(
      currentPositions.map(({ lat, lng }) => `${lat},${lng}`)
    );
    if (distinctPositions.size === 1) {
      map.panTo(currentPositions[0]);
      map.setZoom(15);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    currentPositions.forEach((position) => bounds.extend(position));
    map.fitBounds(bounds, 48);
  }, [coordinateKey, emptyCenterKey, emptyZoom, map]);

  return null;
};

export default HeroMapViewport;
