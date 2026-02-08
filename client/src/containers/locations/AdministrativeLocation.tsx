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

  return (
    <>
      {Object.entries(administrativeDivisions ?? {}).map(([key, value]) => (
        <ul key={key} className="flex items-center gap-2">
          <p className="font-semibold text-sm text-gray-700">
            {capitalizeString(key)}:
          </p>{' '}
          <p className="text-sm text-gray-500">{value}</p>
        </ul>
      ))}
    </>
  );
};

export default AdministrativeLocation;
