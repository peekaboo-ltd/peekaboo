import { describe, expect, it } from 'vitest';
import { parseApproximateLocation } from './useApproximateLocation';

describe('parseApproximateLocation', () => {
  it('keeps only the coarse map fields returned by GeoJS', () => {
    expect(
      parseApproximateLocation({
        ip: '203.0.113.10',
        organization_name: 'Example ISP',
        city: 'Kigali',
        country_code: 'rw',
        latitude: '-1.9441',
        longitude: '30.0619',
        accuracy: 20,
      }),
    ).toEqual({
      position: { lat: -1.9441, lng: 30.0619 },
      accuracyKm: 20,
      label: 'Kigali, RW',
    });
  });

  it('falls back through region and country when a city is unavailable', () => {
    expect(
      parseApproximateLocation({
        region: 'Illinois',
        country: 'United States',
        country_code: 'US',
        latitude: 41.85,
        longitude: -87.65,
      })?.label,
    ).toBe('Illinois, US');
  });

  it('rejects malformed and out-of-range coordinates', () => {
    expect(parseApproximateLocation(null)).toBeNull();
    expect(
      parseApproximateLocation({ latitude: '', longitude: 30.0619 }),
    ).toBeNull();
    expect(
      parseApproximateLocation({ latitude: 91, longitude: 30.0619 }),
    ).toBeNull();
    expect(
      parseApproximateLocation({ latitude: -1.9441, longitude: -181 }),
    ).toBeNull();
  });
});
