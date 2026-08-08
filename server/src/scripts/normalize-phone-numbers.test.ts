import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AppDataSource } from '../data-source';
import {
  applyPhoneNormalizationPlan,
  buildDuplicateUserGroups,
  planRows,
  type NormalizationPlan,
} from './normalize-phone-numbers';

const emptyPlan = (): NormalizationPlan => ({
  users: [],
  organizations: [],
  payments: [],
  pendingWaPhones: [],
  pendingRecipientPhones: [],
  invalid: [],
  duplicateUsers: [],
});

describe('phone normalization duplicate planning', () => {
  it('chooses the oldest user and groups equivalent representations', () => {
    assert.deepEqual(buildDuplicateUserGroups([
      {
        id: 'newer',
        value: '+250788123456',
        createdAt: new Date('2025-01-02'),
      },
      {
        id: 'oldest',
        value: '0788 123 456',
        createdAt: new Date('2025-01-01'),
      },
      {
        id: 'unrelated',
        value: '+250722123456',
        createdAt: new Date('2025-01-01'),
      },
    ]), [{
      e164: '+250788123456',
      survivorId: 'oldest',
      duplicateIds: ['newer'],
    }]);
  });

  it('is deterministic when creation times match', () => {
    const createdAt = new Date('2025-01-01');
    assert.deepEqual(buildDuplicateUserGroups([
      { id: 'b', value: '0788123456', createdAt },
      { id: 'a', value: '+250788123456', createdAt },
    ])[0], {
      e164: '+250788123456',
      survivorId: 'a',
      duplicateIds: ['b'],
    });
  });

  it('does not mutate dry-run rows and plans no change for canonical data', () => {
    const rows = [{ id: 'canonical', value: '+250788123456' }];
    const original = structuredClone(rows);

    assert.deepEqual(planRows(rows, 'users', 'phone_number'), {
      updates: [],
      invalid: [],
    });
    assert.deepEqual(rows, original);
  });

  it('repoints discovered user relations and commits all changes atomically', async () => {
    const originalCreateQueryRunner = AppDataSource.createQueryRunner;
    const calls: Array<{ sql: string; params?: unknown[] }> = [];
    let committed = false;
    let rolledBack = false;
    let released = false;

    (AppDataSource.createQueryRunner as any) = () => ({
      connect: async () => undefined,
      startTransaction: async () => undefined,
      commitTransaction: async () => { committed = true; },
      rollbackTransaction: async () => { rolledBack = true; },
      release: async () => { released = true; },
      query: async (sql: string, params?: unknown[]) => {
        calls.push({ sql, params });
        if (sql.includes('SELECT id FROM organization_memberships')) {
          return [{ id: 'survivor-membership' }];
        }
        if (sql.includes('information_schema.table_constraints')) {
          return [
            { tableName: 'orders', columnName: 'sender_id' },
            { tableName: 'conversations', columnName: 'recipient_id' },
            { tableName: 'payments', columnName: 'created_by_id' },
            { tableName: 'batches', columnName: 'created_by_id' },
          ];
        }
        return [];
      },
    });

    try {
      const plan = emptyPlan();
      plan.users.push({
        id: 'survivor',
        value: '0788 123 456',
        e164: '+250788123456',
      });
      plan.organizations.push({
        id: 'organization',
        value: '0788 123 456',
        e164: '+250788123456',
      });
      plan.duplicateUsers.push({
        e164: '+250788123456',
        survivorId: 'survivor',
        duplicateIds: ['duplicate'],
      });

      await applyPhoneNormalizationPlan(plan);

      assert.equal(committed, true);
      assert.equal(rolledBack, false);
      assert.equal(released, true);
      for (const table of ['orders', 'conversations', 'payments', 'batches']) {
        assert.ok(calls.some(({ sql }) => sql.includes(`UPDATE "${table}"`)));
      }
      assert.ok(calls.some(({ sql }) => sql.includes('DELETE FROM users')));
      assert.ok(calls.some(({ sql }) => sql.includes('UPDATE audit_logs')));
      assert.ok(calls.some(({ sql }) => sql.includes('UPDATE "organizations"')));
    } finally {
      (AppDataSource.createQueryRunner as any) = originalCreateQueryRunner;
    }
  });

  it('rolls back the transaction when any update fails', async () => {
    const originalCreateQueryRunner = AppDataSource.createQueryRunner;
    let committed = false;
    let rolledBack = false;
    let released = false;

    (AppDataSource.createQueryRunner as any) = () => ({
      connect: async () => undefined,
      startTransaction: async () => undefined,
      commitTransaction: async () => { committed = true; },
      rollbackTransaction: async () => { rolledBack = true; },
      release: async () => { released = true; },
      query: async () => {
        throw new Error('database write failed');
      },
    });

    try {
      const plan = emptyPlan();
      plan.payments.push({
        id: 'payment',
        value: '0788 123 456',
        e164: '+250788123456',
      });

      await assert.rejects(
        applyPhoneNormalizationPlan(plan),
        /database write failed/,
      );
      assert.equal(committed, false);
      assert.equal(rolledBack, true);
      assert.equal(released, true);
    } finally {
      (AppDataSource.createQueryRunner as any) = originalCreateQueryRunner;
    }
  });
});
