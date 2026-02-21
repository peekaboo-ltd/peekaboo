import { AuditLogService } from '../services/auditLog.service';
import { UUID } from '../types';
import { AuditContext } from '../middlewares/auditContext.middleware';
import { AuditLogEntityTypes, AuditAction } from '../constants/auditLog.constants';
import { sanitizeAuditValues } from '../helpers/audit.helper';

interface AuditOptions {
  entityType: AuditLogEntityTypes;
  getUserId?: (args: any[]) => UUID | undefined;
  getEntityId: (args: any[]) => UUID;
  getEntity?: (args: any[]) => any;
}

interface AuditCreateOptions {
  entityType: AuditLogEntityTypes;
  getUserId?: (args: any[]) => UUID | undefined;
  /** Extract the entity ID from the method result (defaults to result.id). */
  getEntityId?: (result: any) => UUID;
}

/**
 * Creates an audit trail when a method creates an entity.
 * The original method runs first, then the result is logged.
 */
export function AuditCreate(options: AuditCreateOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Execute original method first to get the created entity
      const result = await originalMethod.apply(this, args);

      try {
        const auditLogService = new AuditLogService();
        const entityId = options.getEntityId
          ? options.getEntityId(result)
          : result?.id;

        let userId = options.getUserId ? options.getUserId(args) : undefined;
        if (!userId) {
          userId = AuditContext.getCurrentUserId();
        }

        if (entityId) {
          // Mark as audited so the TypeORM subscriber skips it
          AuditContext.markEntityAudited(options.entityType, entityId, AuditAction.CREATE);

          await auditLogService.logCreate(
            options.entityType,
            entityId,
            sanitizeAuditValues({ ...(result || {}) }),
            userId
          );
        }
      } catch (error) {
        console.error('Error creating audit log (non-blocking):', error);
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Creates an audit trail when a method updates an entity
 */
export function AuditUpdate(options: AuditOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        // Initialize audit log service
        const auditLogService = new AuditLogService();
        const entityId = options.getEntityId(args);

        // Get userId from arguments or context
        let userId = options.getUserId ? options.getUserId(args) : undefined;
        if (!userId) {
          userId = AuditContext.getCurrentUserId();
        }

        // Get entity before update
        let oldValues = {};
        try {
          const service = this as any;
          if (typeof service.getEntityById === 'function') {
            const entity = await service.getEntityById(entityId);
            if (entity) {
              oldValues = { ...entity };
            }
          }
        } catch (error) {
          console.error('Failed to get entity for audit log:', error);
        }

        // Execute original method
        const result = await originalMethod.apply(this, args);

        // Mark as audited so the TypeORM subscriber skips it
        AuditContext.markEntityAudited(options.entityType, entityId, AuditAction.UPDATE);

        // Create audit log after operation completes
        try {
          await auditLogService.logUpdate(
            options.entityType,
            entityId,
            sanitizeAuditValues(oldValues),
            sanitizeAuditValues({ ...(result || {}) }),
            userId
          );
        } catch (error) {
          console.error('Error creating audit log (non-blocking):', error);
        }

        return result;
      } catch (error) {
        console.error(`Error in ${options.entityType} update:`, error);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Creates an audit trail when a method deletes an entity
 */
export function AuditDelete(options: AuditOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        // Initialize audit log service
        const auditLogService = new AuditLogService();
        const entityId = options.getEntityId(args);

        // Get userId from arguments or context
        let userId = options.getUserId ? options.getUserId(args) : undefined;
        if (!userId) {
          userId = AuditContext.getCurrentUserId();
        }

        // Get entity before deletion
        let oldValues = {};
        if (options.getEntity) {
          oldValues = options.getEntity(args);
        } else {
          try {
            const service = this as any;
            if (typeof service.getEntityById === 'function') {
              const entity = await service.getEntityById(entityId);
              if (entity) {
                oldValues = { ...entity };
              }
            }
          } catch (error) {
            console.error('Failed to get entity for audit log:', error);
          }
        }

        // Mark as audited so the TypeORM subscriber skips it
        AuditContext.markEntityAudited(options.entityType, entityId, AuditAction.DELETE);

        // Create audit log before deletion
        try {
          await auditLogService.logDelete(
            options.entityType,
            entityId,
            sanitizeAuditValues(oldValues),
            userId
          );
        } catch (error) {
          console.error(
            'Error creating delete audit log (non-blocking):',
            error
          );
        }

        // Execute original method
        const result = await originalMethod.apply(this, args);

        return result;
      } catch (error) {
        console.error(`Error in ${options.entityType} delete:`, error);
        throw error;
      }
    };

    return descriptor;
  };
}
