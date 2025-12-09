/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate delivery fee based on distance
 * Base fee: 1500 RWF
 * Additional: 500 RWF per km
 */
export const calculateDeliveryFee = (distanceKm: number): {
  initialFee: number;
  distanceFee: number;
  finalFee: number;
} => {
  const initialFee = 1500;
  const distanceFee = Math.ceil(distanceKm) * 500;
  const finalFee = initialFee + distanceFee;
  
  return {
    initialFee,
    distanceFee,
    finalFee,
  };
};


export const calculateDistanceWithGoogleMaps = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google Maps not loaded'));
      return;
    }

    const service = new google.maps.DistanceMatrixService();
    
    service.getDistanceMatrix(
      {
        origins: [new google.maps.LatLng(origin.lat, origin.lng)],
        destinations: [new google.maps.LatLng(destination.lat, destination.lng)],
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK' && response) {
          const distance = response.rows[0].elements[0].distance;
          if (distance) {
            // Convert meters to kilometers
            const distanceKm = distance.value / 1000;
            resolve(Math.round(distanceKm * 100) / 100);
          } else {
            reject(new Error('No distance data'));
          }
        } else {
          reject(new Error('Distance calculation failed'));
        }
      }
    );
  });
};
