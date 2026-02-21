import { AsyncLocalStorage } from 'node:async_hooks';
import { NextFunction, Request, Response } from 'express';
import { UUID } from '../types';
import { AuthenticatedRequest } from '../types/auth.types';

interface AuditStore {
  userId?: UUID;
  auditedEntities: Set<string>;
}

const asyncLocalStorage = new AsyncLocalStorage<AuditStore>();

/**
 * Provides request-scoped audit context using AsyncLocalStorage.
 * Each concurrent request gets its own isolated store.
 */
export namespace AuditContext {
  export function getStore(): AuditStore | undefined {
    return asyncLocalStorage.getStore();
  }

  export function setCurrentUserId(userId: UUID | undefined): void {
    const store = asyncLocalStorage.getStore();
    if (store && userId) {
      store.userId = userId;
    }
  }

  export function getCurrentUserId(): UUID | undefined {
    return asyncLocalStorage.getStore()?.userId;
  }

  /**
   * Build a unique key for deduplication between decorators and subscriber.
   */
  function buildKey(entityType: string, entityId: string, action: string): string {
    return `${entityType}:${entityId}:${action}`;
  }

  /**
   * Mark an entity change as already audited (called by decorators).
   * The TypeORM subscriber checks this to avoid double-logging.
   */
  export function markEntityAudited(entityType: string, entityId: string, action: string): void {
    const store = asyncLocalStorage.getStore();
    if (store) {
      store.auditedEntities.add(buildKey(entityType, entityId, action));
    }
  }

  /**
   * Check whether a decorator already logged this specific change.
   */
  export function isEntityAudited(entityType: string, entityId: string, action: string): boolean {
    const store = asyncLocalStorage.getStore();
    if (!store) return false;
    return store.auditedEntities.has(buildKey(entityType, entityId, action));
  }

  /**
   * Run a callback within a new audit context store.
   * Used by the middleware to wrap the entire request lifecycle.
   */
  export function run<T>(callback: () => T): T {
    return asyncLocalStorage.run({ auditedEntities: new Set() }, callback);
  }
}

/**
 * Middleware to initialise the AuditContext for every request.
 * Must be placed AFTER the auth middleware so `req.user` is available.
 */
export const auditContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  AuditContext.run(() => {
    const authReq = req as AuthenticatedRequest;

    if (authReq.user && authReq.user.id) {
      AuditContext.setCurrentUserId(authReq.user.id as UUID);
    }

    next();
  });
};
