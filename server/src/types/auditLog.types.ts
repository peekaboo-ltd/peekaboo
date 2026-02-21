import {
  AuditAction,
} from '../constants/auditLog.constants';
import { UUID } from './index';
import { User } from '../entities/user.entity';
import { AbstractEntity } from '../entities/index';

export interface AuditLog extends AbstractEntity {
  action: AuditAction;
  entityType: string;
  entityId: UUID;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldValues?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newValues?: Record<string, any>;
  createdById?: UUID;
  createdBy?: User;
}
