import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface HeroMapViewportProps {
  positions: google.maps.LatLngLiteral[];
}

const KIGALI_CENTER = { lat: -1.9441, lng: 30.0619 };

const HeroMapViewport = ({ positions }: HeroMapViewportProps) => {
  const map = useMap();
  const coordinateKey = positions
    .map(({ lat, lng }) => `${lat},${lng}`)
    .join(';');

  useEffect(() => {
    if (!map) return;

    const currentPositions = coordinateKey
      ? coordinateKey.split(';').map((coordinate) => {
          const [lat, lng] = coordinate.split(',').map(Number);
          return { lat, lng };
        })
      : [];

    if (currentPositions.length === 0) {
      map.panTo(KIGALI_CENTER);
      map.setZoom(12);
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
  }, [coordinateKey, map]);

  return null;
};

export default HeroMapViewport;
