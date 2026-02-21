import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { AuditLog } from '../entities/auditLog.entity';
import { Between, FindOptionsWhere } from 'typeorm';
import { UUID } from '../types';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../helpers/pagination.helper';
import { AuditAction } from '../constants/auditLog.constants';
import { sanitizeAuditValues } from '../helpers/audit.helper';

/**
 * AUDIT LOG SERVICE
 */
export class AuditLogService {
  private auditLogRepository: Repository<AuditLog>;

  constructor() {
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * CREATE AUDIT LOG
   */
  async createAuditLog(
    action: AuditAction,
    entityType: string,
    entityId: UUID,
    oldValues: any,
    newValues: any,
    createdById?: UUID,
    source: 'SERVICE' | 'SUBSCRIBER' = 'SERVICE'
  ): Promise<AuditLog> {
    const auditLog = new AuditLog();
    auditLog.action = action;
    auditLog.entityType = entityType;
    auditLog.entityId = entityId;
    auditLog.oldValues = sanitizeAuditValues(oldValues);
    auditLog.newValues = sanitizeAuditValues(newValues);
    auditLog.createdById = createdById;
    auditLog.source = source;

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * LOG CREATE
   */
  async logCreate(
    entityType: string,
    entityId: UUID,
    newValues: any,
    createdById?: UUID
  ): Promise<AuditLog> {
    return this.createAuditLog(
      AuditAction.CREATE,
      entityType,
      entityId,
      {},
      newValues,
      createdById
    );
  }

  /**
   * LOG UPDATE
   */
  async logUpdate(
    entityType: string,
    entityId: UUID,
    oldValues: any,
    newValues: any,
    createdById?: UUID
  ): Promise<AuditLog> {
    return this.createAuditLog(
      AuditAction.UPDATE,
      entityType,
      entityId,
      oldValues,
      newValues,
      createdById
    );
  }

  /**
   * LOG DELETE
   */
  async logDelete(
    entityType: string,
    entityId: UUID,
    oldValues: any,
    createdById?: UUID
  ): Promise<AuditLog> {
    return this.createAuditLog(
      AuditAction.DELETE,
      entityType,
      entityId,
      oldValues,
      {},
      createdById
    );
  }

  /**
   * FIND AUDIT LOGS
   */
  async fetchAuditLogs({
    page = 0,
    size = 10,
    condition,
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<AuditLog> | FindOptionsWhere<AuditLog>[];
  }): Promise<Pagination<AuditLog>> {
    // GET PAGINATION
    const { skip, take } = getPagination({ page, size });

    const auditLogs = await this.auditLogRepository.findAndCount({
      where: condition,
      skip,
      take,
      relations: {
        createdBy: true,
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    return getPagingData({
      data: auditLogs,
      page,
      size,
    });
  }

  /**
   * FETCH ENTITY HISTORY
   */
  async fetchEntityHistory({
    page = 0,
    size = 10,
    condition,
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<AuditLog> | FindOptionsWhere<AuditLog>[];
  }): Promise<Pagination<AuditLog>> {
    // GET PAGINATION
    const { skip, take } = getPagination({ page, size });

    const auditLogs = await this.auditLogRepository.findAndCount({
      where: condition,
      skip,
      take,
      relations: {
        createdBy: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return getPagingData({
      data: auditLogs,
      page,
      size,
    });
  }
}
