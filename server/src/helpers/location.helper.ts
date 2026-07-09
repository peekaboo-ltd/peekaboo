/**
 * Location Validation Helper
 * Validates delivery location coordinates
 */

export interface LocationValidationResult {
  isValid: boolean;
  error?: string;
}

export interface LocationCoordinates {
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Validates if location coordinates are valid
 * @param location - Location object with latitude and longitude
 * @returns LocationValidationResult with isValid and error message
 */
export function validateDeliveryLocation(
  location?: LocationCoordinates | null
): LocationValidationResult {
  if (!location) {
    return {
      isValid: false,
      error: 'Delivery location is required',
    };
  }

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  // Check if coordinates are numbers
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {
      isValid: false,
      error: 'Delivery location coordinates are required',
    };
  }

  // Validate latitude range
  if (latitude < -90 || latitude > 90) {
    return {
      isValid: false,
      error: 'Invalid coordinates: latitude must be between -90 and 90',
    };
  }

  // Validate longitude range
  if (longitude < -180 || longitude > 180) {
    return {
      isValid: false,
      error: 'Invalid coordinates: longitude must be between -180 and 180',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Quick validation check without detailed error
 * @param location - Location object with latitude and longitude
 * @returns boolean indicating if the location is valid
 */
export function hasValidDeliveryLocation(
  location?: LocationCoordinates | null
): boolean {
  return validateDeliveryLocation(location).isValid;
}
