export interface PersonalDeliveryFeeBand {
  maxDistanceKm: number;
  feeRwf: number;
}

/**
 * Authoritative personal-delivery pricing. The browser and WhatsApp must never
 * maintain independent copies of these bands.
 */
export const PERSONAL_DELIVERY_FEE_BANDS: PersonalDeliveryFeeBand[] = [
  { maxDistanceKm: 3, feeRwf: 600 },
  { maxDistanceKm: 6, feeRwf: 800 },
  { maxDistanceKm: 9, feeRwf: 1000 },
  { maxDistanceKm: 12, feeRwf: 1200 },
  { maxDistanceKm: 15, feeRwf: 1500 },
  { maxDistanceKm: 20, feeRwf: 2000 },
  { maxDistanceKm: 25, feeRwf: 2500 },
  { maxDistanceKm: 30, feeRwf: 3000 },
  { maxDistanceKm: 35, feeRwf: 3500 },
  { maxDistanceKm: 40, feeRwf: 5000 },
  { maxDistanceKm: Number.POSITIVE_INFINITY, feeRwf: 6000 },
];

export const getPersonalDeliveryFee = (distanceKm: number): number => {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    throw new Error("A positive route distance is required");
  }

  return (
    PERSONAL_DELIVERY_FEE_BANDS.find(
      (band) => distanceKm <= band.maxDistanceKm,
    )?.feeRwf ?? 6000
  );
};
