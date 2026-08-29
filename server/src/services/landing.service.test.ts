import assert from 'node:assert/strict';
import { it } from 'node:test';
import { User } from '../entities/user.entity';
import { LandingService } from './landing.service';

it('collapses concurrent rider-cache misses and returns only the public DTO', async () => {
  const service = new LandingService();
  const rider = {
    id: 'private-rider-id',
    name: 'Private Rider',
    email: 'private@example.com',
    phoneNumber: '+250788000000',
    currentLocation: null,
    defaultLocation: { latitude: -1.94417, longitude: 30.06191 },
    assignments: [],
  } as unknown as User;
  let fetchCount = 0;

  const serviceWithStub = service as unknown as {
    userService: {
      fetchUsers: () => Promise<{ rows: User[] }>;
    };
  };
  serviceWithStub.userService = {
    fetchUsers: async () => {
      fetchCount += 1;
      await Promise.resolve();
      return { rows: [rider] };
    },
  };

  const results = await Promise.all(
    Array.from({ length: 10 }, () =>
      service.getSuggestedRider({ latitude: -1.94, longitude: 30.06 }),
    ),
  );

  assert.equal(fetchCount, 1);
  for (const result of results) {
    assert.ok(result);
    assert.deepEqual(Object.keys(result).sort(), [
      'distanceKm',
      'etaMinutes',
      'isLive',
      'latitude',
      'longitude',
      'updatedAt',
    ]);
    assert.doesNotMatch(
      JSON.stringify(result),
      /email|phone|"id"|name/i,
    );
  }
});
