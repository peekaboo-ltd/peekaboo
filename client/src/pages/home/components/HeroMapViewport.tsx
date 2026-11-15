import { MapViewport, type LatLng } from '@/components/maps/mapGl';

interface HeroMapViewportProps {
  positions: LatLng[];
  emptyCenter?: LatLng;
  emptyZoom?: number;
}

const KIGALI_CENTER = { lat: -1.9441, lng: 30.0619 };

const HeroMapViewport = ({
  positions,
  emptyCenter = KIGALI_CENTER,
  emptyZoom = 12,
}: HeroMapViewportProps) => (
  <MapViewport positions={positions} emptyCenter={emptyCenter} emptyZoom={emptyZoom} />
);

export default HeroMapViewport;
