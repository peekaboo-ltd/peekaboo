import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from './data-source';
import { AuditLog } from './entities/auditLog.entity';
import { Batch } from './entities/batch.entity';
import { BusinessPlan } from './entities/businessPlan.entity';
import { Conversation } from './entities/conversation.entity';
import { LocationSearchSession } from './entities/locationSearchSession.entity';
import { Log } from './entities/log.entity';
import { Message } from './entities/message.entity';
import { Order } from './entities/order.entity';
import { OrderActivity } from './entities/orderActivity.entity';
import { OrderAssignment } from './entities/orderAssignment.entity';
import { Organization } from './entities/organization.entity';
import { OrganizationBilling } from './entities/organizationBilling.entity';
import { OrganizationMembership } from './entities/organizationMembership.entity';
import { Payment } from './entities/payment.entity';
import { PendingOrderSession } from './entities/pendingOrderSession.entity';
import { PushSubscription } from './entities/pushSubscription.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { UserProblemReport } from './entities/userProblemReport.entity';
import { UserRole } from './entities/userRole.entity';
import { UserStatusProof } from './entities/userStatusProof.entity';
import { requireDatabase } from './middlewares/database.middleware';

const EXPECTED_ENTITIES = [
  AuditLog,
  Batch,
  BusinessPlan,
  Conversation,
  LocationSearchSession,
  Log,
  Message,
  Order,
  OrderActivity,
  OrderAssignment,
  Organization,
  OrganizationBilling,
  OrganizationMembership,
  Payment,
  PendingOrderSession,
  PushSubscription,
  Role,
  User,
  UserProblemReport,
  UserRole,
  UserStatusProof,
];

describe('data-source entity registration', () => {
  it('registers entities as explicit classes instead of path globs', () => {
    const entities = AppDataSource.options.entities as unknown[];
    assert.ok(Array.isArray(entities), 'entities option should be an array');
    assert.equal(entities.length, EXPECTED_ENTITIES.length);
    for (const entity of entities) {
      assert.equal(
        typeof entity,
        'function',
        `entity entries must be classes, got: ${String(entity)}`
      );
    }
    for (const entity of EXPECTED_ENTITIES) {
      assert.ok(
        (entities as Function[]).includes(entity),
        `${entity.name} must be registered on the data source`
      );
    }
  });

  it('builds metadata for every entity without a database connection', async () => {
    // buildMetadatas is protected on the typings but performs no I/O;
    // reaching through it validates decorators, relations, and imports.
    const internals = AppDataSource as unknown as {
      buildMetadatas(): Promise<void>;
    };
    await internals.buildMetadatas();
    for (const entity of EXPECTED_ENTITIES) {
      assert.equal(
        AppDataSource.hasMetadata(entity),
        true,
        `no metadata built for ${entity.name}`
      );
    }
    assert.equal(AppDataSource.getMetadata(User).name, 'User');
  });
});

describe('requireDatabase middleware', () => {
  it('responds 503 while the database is not initialized', () => {
    assert.equal(AppDataSource.isInitialized, false);

    let statusCode = 0;
    let body: unknown;
    let nextCalled = false;
    const req = {} as Request;
    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(payload: unknown) {
        body = payload;
        return this;
      },
    } as unknown as Response;
    const next = (() => {
      nextCalled = true;
    }) as NextFunction;

    requireDatabase(req, res, next);

    assert.equal(statusCode, 503);
    assert.equal(nextCalled, false);
    assert.match((body as { message: string }).message, /unavailable/i);
  });
});
