export interface LocationCoordinates {
  latitude: number | null;
  longitude: number | null;
}

export interface LocationError {
  code: number;
  message: string;
}

export const getCurrentLocation = (): Promise<LocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      } as LocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject({
          code: error.code,
          message: error.message,
        } as LocationError);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

export const calculateHaversineDistance = (
  from: LocationCoordinates,
  to: LocationCoordinates
): number => {
  if (
    !from ||
    !to ||
    from?.latitude === null ||
    from?.longitude === null ||
    to?.latitude === null ||
    to?.longitude === null
  ) {
    return 0;
  }
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((to?.latitude - from?.latitude) * Math.PI) / 180;
  const dLon = ((to?.longitude - from?.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from?.latitude * Math.PI) / 180) *
      Math.cos((to?.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const estimateTwoWheelerTime = (distanceKm: number): number => {
  // Average two-wheeler speed in urban areas: 25 km/h
  // Add 20% buffer for traffic and stops
  const avgSpeed = 25;
  const timeHours = (distanceKm / avgSpeed) * 1.2;
  return Math.round(timeHours * 60); // Return in minutes
};
