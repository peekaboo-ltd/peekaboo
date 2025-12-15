import { useState, useEffect, useCallback } from 'react';
import { useUpdateRiderLocationMutation } from '@/api/mutations/riderLocation.mutations';
import { toast } from 'sonner';

interface UseRiderLocationOptions {
  enabled?: boolean;
  updateInterval?: number; // in milliseconds
  highAccuracy?: boolean;
  geolocationTimeout?: number; // in milliseconds
}

export const useRiderLocation = (options: UseRiderLocationOptions = {}) => {
  const {
    enabled = false,
    updateInterval = 30000, // 30 seconds default
    highAccuracy = false,
    geolocationTimeout = 45000, // 45 seconds for geolocation (increased from 10s)
  } = options;

  const [isTracking, setIsTracking] = useState(enabled);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const [updateRiderLocation, { isLoading }] = useUpdateRiderLocationMutation();

  // Get current position
  const updateLocation = useCallback(async () => {
    if (!isTracking) return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setError(null);

        try {
          await updateRiderLocation({
            latitude,
            longitude,
            isOnline: true,
          }).unwrap();
          setLastUpdate(new Date());
        } catch (err: any) {
          console.error('Failed to update location:', err);
          setError(err?.data?.message || 'Failed to update location');
        }
      },
      (err) => {
        setError(err.message);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please enable location access.');
        } else if (err.code === err.TIMEOUT) {
          toast.error('Location retrieval timed out. Trying again...');
          // Retry once with lower accuracy
          setTimeout(() => {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({ latitude, longitude });
                setError(null);

                try {
                  await updateRiderLocation({
                    latitude,
                    longitude,
                    isOnline: true,
                  }).unwrap();
                  setLastUpdate(new Date());
                } catch (err: any) {
                  setError(err?.data?.message || 'Failed to update location');
                }
              },
              (retryErr) => {
                console.error('Geolocation retry failed:', retryErr);
                setError('Failed to get location. Please try again.');
              },
              {
                enableHighAccuracy: false,
                timeout: geolocationTimeout,
                maximumAge: 60000, // Accept cached location up to 1 minute old
              }
            );
          }, 1000);
        }
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: geolocationTimeout,
        maximumAge: 0,
      }
    );
  }, [isTracking, updateRiderLocation, highAccuracy]);

  // Start tracking
  const startTracking = useCallback(() => {
    setIsTracking(true);
    toast.success('Location tracking started');
  }, []);

  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    toast.info('Location tracking stopped');
  }, []);

  // Update location periodically
  useEffect(() => {
    if (!isTracking) return;

    // Initial update
    updateLocation();

    // Set up interval
    const intervalId = setInterval(updateLocation, updateInterval);

    return () => clearInterval(intervalId);
  }, [isTracking, updateLocation, updateInterval]);

  return {
    isTracking,
    currentLocation,
    error,
    lastUpdate,
    isUpdating: isLoading,
    startTracking,
    stopTracking,
    updateLocation,
  };
};
