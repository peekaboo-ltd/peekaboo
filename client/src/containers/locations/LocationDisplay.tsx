import { useGetAdministrativeDivisions } from '@/hooks/locations/location.hooks';
import { useEffect } from 'react';

type Coordinate = {
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;
  lng?: number | null;
};

const LocationDisplay = ({ location }: { location?: Coordinate | null }) => {
  const lat = location?.latitude ?? location?.lat ?? null;
  const lng = location?.longitude ?? location?.lng ?? null;

  const {
    getAdministrativeDivisions,
    isLoading,
    administrativeDivisions,
  } = useGetAdministrativeDivisions();

  useEffect(() => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    getAdministrativeDivisions({ lat, lng });
  }, [lat, lng, getAdministrativeDivisions]);

  if (!location || typeof lat !== 'number' || typeof lng !== 'number') {
    return <span className="text-gray-400">No location</span>;
  }

  if (isLoading) {
    return (
      <span className="inline-block h-3 w-32 rounded-full bg-slate-200 animate-pulse" />
    );
  }

  if (!administrativeDivisions) {
    return (
      <span className="text-gray-500 text-sm">
        {lat.toFixed(5)}, {lng.toFixed(5)}
      </span>
    );
  }

  const { cell, sector, district } = administrativeDivisions;
  const label = [cell, sector, district].filter(Boolean).join(', ');

  return (
    <span className="text-sm text-gray-700" title={`${lat.toFixed(6)}, ${lng.toFixed(6)}`}>
      {label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
    </span>
  );
};

export default LocationDisplay;
