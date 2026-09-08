import { useEffect, useRef, useState } from 'react';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useNearestPlace } from '@/hooks/locations/useNearestPlace';
import type { HomeFormValues, PickupSource } from '@/pages/home/home.types';
import type { OrderLocation } from '@/types/order.type';
import {
  coordinateKey,
  getCurrentLocation,
  locationErrorKey,
  type LocationError,
} from '@/utils/locations.util';
import { useI18n } from '@/i18n/i18n';

export type GeolocationTarget = 'locationFrom' | 'locationTo';

export interface GeolocationPickupState {
  pickupSource: PickupSource;
  setPickupSource: (source: PickupSource) => void;
  locationError: string | null;
  // Which field the pending request and any error belong to, so the other
  // field does not mirror a failure it never triggered.
  activeTarget: GeolocationTarget | null;
  isLocating: boolean;
  useMyLocation: (target?: GeolocationTarget) => Promise<void>;
  clearLocationError: () => void;
}

export const useGeolocationPickup = (
  control: Control<HomeFormValues>,
  setValue: UseFormSetValue<HomeFormValues>,
): GeolocationPickupState => {
  const { t } = useI18n();
  const locationFrom = useWatch({ control, name: 'locationFrom' });
  const locationTo = useWatch({ control, name: 'locationTo' });
  const pickupSource = useWatch({ control, name: 'pickupSource' }) ?? 'search';
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activeTarget, setActiveTarget] = useState<GeolocationTarget | null>(null);
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
    setActiveTarget(null);
  };

  useEffect(() => {
    if (
      pickupSource === 'geolocation' &&
      coordinateKey(locationFrom) !== geolocationKey.current &&
      geolocationKey.current !== null
    ) {
      setValue('pickupSource', 'search', { shouldDirty: true });
    }
    if (locationFrom || locationTo) {
      setLocationError(null);
      setActiveTarget(null);
    }
  }, [locationFrom, locationTo, pickupSource, setValue]);

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

  const locationForDropoffLookup =
    locationTo &&
    !locationTo.name?.trim() &&
    !locationTo.formattedAddress?.trim()
      ? locationTo
      : null;
  const nearestDropoff = useNearestPlace(locationForDropoffLookup);

  useEffect(() => {
    if (
      !locationTo ||
      locationTo.name?.trim() ||
      locationTo.formattedAddress?.trim() ||
      nearestDropoff.isLoading ||
      (!nearestDropoff.placeName && !nearestDropoff.address)
    ) {
      return;
    }

    setValue(
      'locationTo',
      {
        ...locationTo,
        ...(nearestDropoff.placeName ? { name: nearestDropoff.placeName } : {}),
        ...(nearestDropoff.address
          ? { formattedAddress: nearestDropoff.address }
          : {}),
      },
      { shouldDirty: true, shouldValidate: true },
    );
  }, [locationTo, nearestDropoff, setValue]);

  const useMyLocation = async (target: GeolocationTarget = 'locationFrom') => {
    setIsLocating(true);
    setLocationError(null);
    setActiveTarget(target);

    try {
      // Deliberately user-triggered: never move this call into a useEffect.
      const location = await getCurrentLocation();
      if (
        typeof location.latitude !== 'number' ||
        typeof location.longitude !== 'number'
      ) {
        throw { code: 2, message: t('location.unavailable') } as LocationError;
      }

      const nextLocation: OrderLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
      };

      if (target === 'locationTo') {
        setValue('locationTo', nextLocation, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        return;
      }

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
          : ({ code: -1, message: t('location.unknownError') } as LocationError);
      setLocationError(t(locationErrorKey(locationFailure)));
    } finally {
      setIsLocating(false);
    }
  };

  return {
    pickupSource,
    setPickupSource,
    locationError,
    activeTarget,
    isLocating,
    useMyLocation,
    clearLocationError: () => {
      setLocationError(null);
      setActiveTarget(null);
    },
  };
};
