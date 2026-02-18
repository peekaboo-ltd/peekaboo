import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { usersAPI } from '../services/api/users';
import { useAuthStore } from '../store/authStore';
import { LOCATION_UPDATE_INTERVAL_MS } from '../utils/constants';

export const useLocationTracking = () => {
  const { isAuthenticated, user, setUser } = useAuthStore();
  const [lastLocationCollectedAt, setLastLocationCollectedAt] = useState<string | null>(
    user?.currentLocation?.collectedAt || null
  );
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    setLastLocationCollectedAt(user?.currentLocation?.collectedAt || null);
  }, [user?.currentLocation?.collectedAt]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    let isMounted = true;

    const collectAndSendLocation = async () => {
      if (isUpdatingRef.current) {
        return;
      }

      try {
        isUpdatingRef.current = true;

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const currentLocation = await usersAPI.updateCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (!isMounted) {
          return;
        }

        setLastLocationCollectedAt(currentLocation.collectedAt || new Date().toISOString());
        const latestUser = useAuthStore.getState().user;
        if (latestUser) {
          setUser({
            ...latestUser,
            currentLocation,
          });
        }
      } catch {
        // No-op: location updates should never interrupt app usage.
      } finally {
        isUpdatingRef.current = false;
      }
    };

    collectAndSendLocation();

    const intervalId = setInterval(collectAndSendLocation, LOCATION_UPDATE_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isAuthenticated, setUser, user?.id]);

  return {
    lastLocationCollectedAt,
  };
};
