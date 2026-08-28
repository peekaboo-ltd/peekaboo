export const KIGALI_CENTER = { lat: -1.9441, lng: 30.0619 };

/** Peekaboo office — Downtown Kigali CBD. */
export const DOWNTOWN_KIGALI_HQ = { lat: -1.9501, lng: 30.0588 };

export const getApproximateZoom = (accuracyKm: number | null): number => {
  if (accuracyKm === null) return 11;
  if (accuracyKm <= 5) return 13;
  if (accuracyKm <= 25) return 12;
  if (accuracyKm <= 100) return 10;
  return 8;
};
