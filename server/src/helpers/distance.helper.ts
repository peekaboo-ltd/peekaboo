import { User } from '../entities/user.entity';
import { OrderAssignmentStatus } from '../constants/order.constants';

interface Coordinates {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;
const PROXIMITY_THRESHOLD_KM = 5;

/**
 * Calculate the distance between two coordinates using the Haversine formula.
 * Returns distance in kilometers.
 */
export function haversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Get the rider's best available location (currentLocation > defaultLocation).
 */
export function getRiderLocation(rider: User): Coordinates | null {
  if (rider.currentLocation?.latitude != null && rider.currentLocation?.longitude != null) {
    return rider.currentLocation;
  }
  if (rider.defaultLocation?.latitude != null && rider.defaultLocation?.longitude != null) {
    return rider.defaultLocation;
  }
  return null;
}

/**
 * Count only active/pending assignments for a rider.
 */
function getActiveAssignmentCount(rider: User): number {
  if (!rider.assignments) return 0;
  return rider.assignments.filter(
    (a) =>
      a.status === OrderAssignmentStatus.ACTIVE ||
      a.status === OrderAssignmentStatus.PENDING
  ).length;
}

/**
 * Sort riders by proximity to a pickup location.
 *
 * - Riders are sorted by distance to the pickup (closest first).
 * - Riders within 5km of the closest rider are grouped together,
 *   and within that group sorted by active assignment count (fewest first).
 * - Riders without any location data are placed at the end,
 *   sorted by active assignment count.
 */
export function sortRidersByProximity(
  riders: User[],
  pickupLocation: Coordinates
): User[] {
  if (!riders || riders.length === 0) return [];

  const ridersWithDistance = riders.map((rider) => {
    const location = getRiderLocation(rider);
    const distance = location
      ? haversineDistance(location, pickupLocation)
      : Infinity;
    return { rider, distance };
  });

  // Sort by distance ascending
  ridersWithDistance.sort((a, b) => a.distance - b.distance);

  const closestDistance = ridersWithDistance[0].distance;

  // If no rider has a location, fall back to assignment-count sort
  if (closestDistance === Infinity) {
    ridersWithDistance.sort(
      (a, b) =>
        getActiveAssignmentCount(a.rider) -
        getActiveAssignmentCount(b.rider)
    );
    return ridersWithDistance.map((r) => r.rider);
  }

  // Split into proximity group (within 5km of closest) and the rest
  const proximityGroup = ridersWithDistance.filter(
    (r) => r.distance <= closestDistance + PROXIMITY_THRESHOLD_KM
  );
  const remaining = ridersWithDistance.filter(
    (r) => r.distance > closestDistance + PROXIMITY_THRESHOLD_KM
  );

  // Within the proximity group, sort by active assignment count
  proximityGroup.sort(
    (a, b) =>
      getActiveAssignmentCount(a.rider) -
      getActiveAssignmentCount(b.rider)
  );

  return [
    ...proximityGroup.map((r) => r.rider),
    ...remaining.map((r) => r.rider),
  ];
}
