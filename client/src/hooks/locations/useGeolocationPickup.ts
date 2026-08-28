import { useEffect, useRef, useState } from 'react';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useNearestPlace } from '@/hooks/locations/useNearestPlace';
import type { HomeFormValues, PickupSource } from '@/pages/home/home.types';
import type { OrderLocation } from '@/types/order.type';
import {
  coordinateKey,
  getCurrentLocation,
  locationErrorMessage,
  type LocationError,
} from '@/utils/locations.util';

export interface GeolocationPickupState {
  pickupSource: PickupSource;
  setPickupSource: (source: PickupSource) => void;
  locationError: string | null;
  isLocating: boolean;
  useMyLocation: () => Promise<void>;
  clearLocationError: () => void;
}

export const useGeolocationPickup = (
  control: Control<HomeFormValues>,
  setValue: UseFormSetValue<HomeFormValues>,
): GeolocationPickupState => {
  const locationFrom = useWatch({ control, name: 'locationFrom' });
  const pickupSource = useWatch({ control, name: 'pickupSource' }) ?? 'search';
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const geolocationKey = useRef<string | null>(null);

  const locationForLookup =
    pickupSource === 'geolocation' &&
    locationFrom &&
    !locationFrom.name?.trim() &&
    !locationFrom.formattedAddress?.trim()
      ? locationFrom
      : null;
  const nearestPlace = useNearestPlace(locationForLookup);

  const setPickupSource = (source: PickupSource) => {
    setValue('pickupSource', source, { shouldDirty: true });
    setLocationError(null);
  };

  useEffect(() => {
    if (
      pickupSource === 'geolocation' &&
      coordinateKey(locationFrom) !== geolocationKey.current &&
      geolocationKey.current !== null
    ) {
      setValue('pickupSource', 'search', { shouldDirty: true });
    }
    if (locationFrom) setLocationError(null);
  }, [locationFrom, pickupSource, setValue]);

  useEffect(() => {
    if (
      pickupSource !== 'geolocation' ||
      !locationFrom ||
      locationFrom.name?.trim() ||
      locationFrom.formattedAddress?.trim() ||
      nearestPlace.isLoading ||
      (!nearestPlace.placeName && !nearestPlace.address)
    ) {
      return;
    }

    setValue(
      'locationFrom',
      {
        ...locationFrom,
        ...(nearestPlace.placeName ? { name: nearestPlace.placeName } : {}),
        ...(nearestPlace.address
          ? { formattedAddress: nearestPlace.address }
          : {}),
      },
      { shouldDirty: true, shouldValidate: true },
    );
  }, [locationFrom, nearestPlace, pickupSource, setValue]);

  const useMyLocation = async () => {
    setIsLocating(true);
    setLocationError(null);

    try {
      // Deliberately user-triggered: never move this call into a useEffect.
      const location = await getCurrentLocation();
      if (
        typeof location.latitude !== 'number' ||
        typeof location.longitude !== 'number'
      ) {
        throw { code: 2, message: 'Location unavailable' } as LocationError;
      }

      const nextLocation: OrderLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
      };
      geolocationKey.current = coordinateKey(nextLocation);
      setValue('pickupSource', 'geolocation', { shouldDirty: true });
      setValue('locationFrom', nextLocation, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    } catch (error) {
      const locationFailure =
        typeof error === 'object' && error && 'code' in error
          ? (error as LocationError)
          : ({ code: -1, message: 'Unknown location error' } as LocationError);
      setLocationError(locationErrorMessage(locationFailure));
    } finally {
      setIsLocating(false);
    }
  };

  return {
    pickupSource,
    setPickupSource,
    locationError,
    isLocating,
    useMyLocation,
    clearLocationError: () => setLocationError(null),
  };
};
