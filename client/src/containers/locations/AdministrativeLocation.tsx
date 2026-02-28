import { useGetAdministrativeDivisions } from '@/hooks/locations/location.hooks';
import type { LocationCoordinates } from '@/utils/locations.util';
import { capitalizeString } from '@/utils/strings.util';
import { useEffect } from 'react';

const AdministrativeLocation = ({
  location,
}: {
  location?: LocationCoordinates | null;
}) => {
  const {
    getAdministrativeDivisions,
    isLoading: administrativeDivisionsIsLoading,
    administrativeDivisions,
  } = useGetAdministrativeDivisions();

  useEffect(() => {
    if (!location) {
      return;
    }
    getAdministrativeDivisions({
      lat: location.latitude,
      lng: location.longitude,
    });
  }, [location, getAdministrativeDivisions]);

  if (administrativeDivisionsIsLoading) {
    return (
      <section className="space-y-3 animate-pulse" aria-live="polite">
        {[0, 1, 2].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <span className="h-3 w-20 rounded-full bg-slate-200" />
            <span className="h-3 w-40 rounded-full bg-slate-100" />
          </div>
        ))}
      </section>
    );
  }

  if (!administrativeDivisions && !administrativeDivisionsIsLoading) {
    return (
      <p className="text-sm text-slate-600">
       {location?.latitude?.toFixed(4)}, {location?.longitude?.toFixed(4)}
      </p>
    );
  }

  return (
    <>
      {Object.entries(administrativeDivisions ?? {}).map(([key, value]) => (
        <p
          key={key}
          className="grid grid-cols-1 gap-1 text-sm text-slate-600 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-2"
        >
          <span className="text-sm text-slate-800">
            {capitalizeString(key)}:
          </span>
          <span className="break-words text-sm text-slate-500">{value}</span>
        </p>
      ))}
    </>
  );
};

export default AdministrativeLocation;
