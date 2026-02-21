import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { AuditLog } from '../entities/auditLog.entity';
import { AuditAction, AuditLogEntityTypes } from '../constants/auditLog.constants';
import { AuditContext } from '../middlewares/auditContext.middleware';
import { sanitizeAuditValues } from '../helpers/audit.helper';

// Entities to audit at the repository level
import { Order } from '../entities/order.entity';
import { OrderActivity } from '../entities/orderActivity.entity';
import { OrderAssignment } from '../entities/orderAssignment.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/userRole.entity';
import { Organization } from '../entities/organization.entity';
import { OrganizationMembership } from '../entities/organizationMembership.entity';
import { OrganizationBilling } from '../entities/organizationBilling.entity';
import { Payment } from '../entities/payment.entity';
import { BusinessPlan } from '../entities/businessPlan.entity';
import { Batch } from '../entities/batch.entity';
import { Role } from '../entities/role.entity';

/**
 * Map entity constructor names to AuditLogEntityTypes values.
 * Entities not listed here (AuditLog, Log, Message, Conversation) are excluded.
 */
const ENTITY_TYPE_MAP: Record<string, AuditLogEntityTypes> = {
  Order: AuditLogEntityTypes.ORDER,
  OrderActivity: AuditLogEntityTypes.ORDER_STATUS,
  OrderAssignment: AuditLogEntityTypes.ORDER_ASSIGNMENT,
  User: AuditLogEntityTypes.USER,
  UserRole: AuditLogEntityTypes.USER_ROLE,
  Organization: AuditLogEntityTypes.ORGANIZATION,
  OrganizationMembership: AuditLogEntityTypes.ORGANIZATION_MEMBERSHIP,
  OrganizationBilling: AuditLogEntityTypes.ORGANIZATION_BILLING,
  Payment: AuditLogEntityTypes.PAYMENT,
  BusinessPlan: AuditLogEntityTypes.BUSINESS_PLAN,
  Batch: AuditLogEntityTypes.BATCH,
  Role: AuditLogEntityTypes.ROLE,
};

function getEntityName(entity: any): string | undefined {
  if (!entity || !entity.constructor) return undefined;
  return entity.constructor.name;
}

function getAuditEntityType(entity: any): AuditLogEntityTypes | undefined {
  const name = getEntityName(entity);
  return name ? ENTITY_TYPE_MAP[name] : undefined;
}

/**
 * TypeORM subscriber that creates audit log entries for every
 * insert / update / remove on auditable entities.
 *
 * This acts as a safety net for changes that bypass service-layer
 * decorators (e.g. direct repository calls inside transactions).
 *
 * If a decorator has already logged the same change (tracked via
 * AuditContext.isEntityAudited), the subscriber skips it.
 */
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {

  async afterInsert(event: InsertEvent<any>): Promise<void> {
    await this.logEvent(event.entity, AuditAction.CREATE, {}, event.entity, event);
  }

  async afterUpdate(event: UpdateEvent<any>): Promise<void> {
    const oldValues = event.databaseEntity || {};
    const newValues = event.entity || {};
    await this.logEvent(event.entity || event.databaseEntity, AuditAction.UPDATE, oldValues, newValues, event);
  }

  async afterRemove(event: RemoveEvent<any>): Promise<void> {
    const entity = event.databaseEntity || event.entity;
    await this.logEvent(entity, AuditAction.DELETE, entity, {}, event);
  }

  private async logEvent(
    entity: any,
    action: AuditAction,
    oldValues: any,
    newValues: any,
    event: InsertEvent<any> | UpdateEvent<any> | RemoveEvent<any>,
  ): Promise<void> {
    try {
      if (!entity) return;

      const entityType = getAuditEntityType(entity);
      if (!entityType) return; // Not an auditable entity

      const entityId = entity.id;
      if (!entityId) return;

      // Skip if a decorator already logged this change
      if (AuditContext.isEntityAudited(entityType, entityId, action)) {
        return;
      }

      const userId = AuditContext.getCurrentUserId();

      const auditLog = new AuditLog();
      auditLog.action = action;
      auditLog.entityType = entityType;
      auditLog.entityId = entityId;
      auditLog.oldValues = sanitizeAuditValues(oldValues ? { ...oldValues } : {});
      auditLog.newValues = sanitizeAuditValues(newValues ? { ...newValues } : {});
      auditLog.createdById = userId;
      auditLog.source = 'SUBSCRIBER';

      // Use the event's manager so the audit log participates in the same
      // transaction (if any). This guarantees the audit row is rolled back
      // together with the business data when a transaction fails.
      await event.manager.getRepository(AuditLog).save(auditLog);
    } catch (error) {
      // Non-blocking: audit failures must not break business operations
      console.error('AuditSubscriber: failed to create audit log:', error);
    }
  }
}
