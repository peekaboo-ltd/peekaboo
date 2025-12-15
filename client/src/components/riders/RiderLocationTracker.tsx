import { useEffect, useState } from 'react';
import { useRiderLocation } from '@/hooks/riders/use-rider-location';
import { useSetRiderOfflineMutation } from '@/api/mutations/riderLocation.mutations';
import { toast } from 'sonner';

export const RiderLocationTracker = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [setRiderOffline] = useSetRiderOfflineMutation();

  const {
    isTracking,
    currentLocation,
    error,
    lastUpdate,
    isUpdating,
    startTracking,
    stopTracking,
  } = useRiderLocation({
    enabled: isOnline,
    updateInterval: 30000, // Update every 30 seconds
    highAccuracy: true,
  });

  const handleToggleOnline = async () => {
    if (isOnline) {
      // Going offline
      try {
        await setRiderOffline().unwrap();
        stopTracking();
        setIsOnline(false);
        toast.success('You are now offline');
      } catch (err: any) {
        toast.error(err?.data?.message || 'Failed to go offline');
      }
    } else {
      // Going online
      setIsOnline(true);
      startTracking();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isOnline) {
        setRiderOffline();
      }
    };
  }, [isOnline, setRiderOffline]);

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Location Tracking</h3>
          <p className="text-sm text-gray-600">
            {isOnline ? 'You are online and visible to customers' : 'You are offline'}
          </p>
        </div>
        <button
          onClick={handleToggleOnline}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isOnline
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isOnline && (
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Status:</span>
            <span className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
              <span className="font-medium text-gray-900">
                {isTracking ? 'Tracking Active' : 'Tracking Paused'}
              </span>
            </span>
          </div>

          {currentLocation && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Latitude:</span>
                <span className="font-mono text-gray-900">
                  {currentLocation.latitude.toFixed(6)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Longitude:</span>
                <span className="font-mono text-gray-900">
                  {currentLocation.longitude.toFixed(6)}
                </span>
              </div>
            </>
          )}

          {lastUpdate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last Update:</span>
              <span className="text-gray-900">
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          )}

          {isUpdating && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Updating location...</span>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <p className="font-medium mb-1">How it works:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Toggle "Go Online" to start sharing your location</li>
          <li>Your location updates automatically every 30 seconds</li>
          <li>Customers will see you when searching for nearby riders</li>
          <li>Toggle "Go Offline" when you're unavailable</li>
        </ul>
      </div>
    </div>
  );
};
