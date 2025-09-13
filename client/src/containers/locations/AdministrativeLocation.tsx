import Loader from '@/components/inputs/Loader';
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
    return <Loader className="text-primary" />;
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
