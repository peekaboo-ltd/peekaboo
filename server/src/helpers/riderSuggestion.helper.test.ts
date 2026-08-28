import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { User } from '../entities/user.entity';
import { ValidationError } from './errors.helper';
import {
  LIVE_FIX_MAX_AGE_MS,
  parseCoordinateQuery,
  toSuggestedRiderPosition,
} from './riderSuggestion.helper';

const pickup = { latitude: -1.94, longitude: 30.06 };

const riderWith = (locations: Pick<User, 'currentLocation' | 'defaultLocation'>) =>
  locations as User;

describe('rider suggestion helper', () => {
  it('rejects missing, non-numeric, and out-of-range coordinates', () => {
    for (const [latitude, longitude] of [
      [undefined, '30.06'],
      ['abc', '30.06'],
      ['91', '30.06'],
      ['-1.94', '-181'],
    ]) {
      assert.throws(
        () => parseCoordinateQuery(latitude, longitude),
        ValidationError
      );
    }
  });

  it('rounds request coordinates to two decimal places', () => {
    assert.deepEqual(parseCoordinateQuery('-1.94417', '30.06191'), {
      latitude: -1.94,
      longitude: 30.06,
    });
  });

  it('prefers a fresh current-location fix', () => {
    const now = new Date('2026-08-28T12:00:00.000Z');
    const result = toSuggestedRiderPosition(
      riderWith({
        currentLocation: {
          latitude: -1.94417,
          longitude: 30.06191,
          collectedAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        },
        defaultLocation: { latitude: -1.8, longitude: 30.2 },
      }),
      pickup,
      now
    );

    assert.equal(result?.latitude, -1.944);
    assert.equal(result?.longitude, 30.062);
    assert.equal(result?.isLive, true);
    assert.equal(result?.updatedAt, '2026-08-28T11:55:00.000Z');
  });

  it('falls back to the default location when the fix is 31 minutes old', () => {
    const now = new Date('2026-08-28T12:00:00.000Z');
    const result = toSuggestedRiderPosition(
      riderWith({
        currentLocation: {
          latitude: -1.7,
          longitude: 30.3,
          collectedAt: new Date(
            now.getTime() - LIVE_FIX_MAX_AGE_MS - 60 * 1000
          ).toISOString(),
        },
        defaultLocation: { latitude: -1.95555, longitude: 30.07777 },
      }),
      pickup,
      now
    );

    assert.equal(result?.latitude, -1.956);
    assert.equal(result?.longitude, 30.078);
    assert.equal(result?.isLive, false);
    assert.equal(result?.updatedAt, null);
  });

  it('returns null when neither a fresh fix nor a default location exists', () => {
    const now = new Date('2026-08-28T12:00:00.000Z');
    const result = toSuggestedRiderPosition(
      riderWith({
        currentLocation: {
          latitude: -1.9,
          longitude: 30.1,
          collectedAt: new Date(
            now.getTime() - LIVE_FIX_MAX_AGE_MS - 1
          ).toISOString(),
        },
        defaultLocation: null as unknown as User['defaultLocation'],
      }),
      pickup,
      now
    );

    assert.equal(result, null);
  });

  it('never exposes rider coordinates beyond three decimal places', () => {
    const result = toSuggestedRiderPosition(
      riderWith({
        currentLocation: null as unknown as User['currentLocation'],
        defaultLocation: { latitude: -1.9441789, longitude: 30.0619123 },
      }),
      pickup
    );

    assert.match(String(result?.latitude), /^-?\d+(?:\.\d{1,3})?$/);
    assert.match(String(result?.longitude), /^-?\d+(?:\.\d{1,3})?$/);
  });
});
