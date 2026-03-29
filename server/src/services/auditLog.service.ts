import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { AuditLog } from '../entities/auditLog.entity';
import { FindOptionsWhere } from 'typeorm';
import { UUID } from '../types';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../helpers/pagination.helper';
import { AuditAction, AuditLogEntityTypes } from '../constants/auditLog.constants';
import { sanitizeAuditValues } from '../helpers/audit.helper';

interface CurrentLocationData {
  latitude?: number | string;
  longitude?: number | string;
}

interface CurrentLocationTimelineItem {
  timestamp: string;
  latitude: number;
  longitude: number;
  source: 'SERVICE' | 'SUBSCRIBER';
  action: AuditAction;
  actor?: {
    id: UUID;
    name: string | undefined;
    email: string | undefined;
  };
}

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

  async fetchUserCurrentLocationHistory({
    userId,
    page = 0,
    size = 10,
    startTime,
    endTime,
  }: {
    userId: UUID;
    page?: number;
    size?: number;
    startTime?: Date;
    endTime?: Date;
  }): Promise<Pagination<CurrentLocationTimelineItem>> {
    const { skip, take } = getPagination({ page, size });

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.createdBy', 'createdBy')
      .where('auditLog.entityType = :entityType', {
        entityType: AuditLogEntityTypes.USER,
      })
      .andWhere('auditLog.entityId = :userId', { userId })
      .andWhere(
        `(
          (auditLog.oldValues ? 'currentLocation')
          OR
          (auditLog.newValues ? 'currentLocation')
        )`
      )
      .andWhere(
        `(COALESCE(auditLog.oldValues -> 'currentLocation', '{}'::jsonb) IS DISTINCT FROM COALESCE(auditLog.newValues -> 'currentLocation', '{}'::jsonb))`
      );

    if (startTime) {
      queryBuilder.andWhere('auditLog.createdAt >= :startTime', { startTime });
    }

    if (endTime) {
      queryBuilder.andWhere('auditLog.createdAt <= :endTime', { endTime });
    }

    const [auditLogs, total] = await queryBuilder
      .orderBy('auditLog.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    const timeline: CurrentLocationTimelineItem[] = [];

    for (const auditLog of auditLogs) {
      const locationData =
        (auditLog.newValues?.currentLocation as CurrentLocationData | undefined) ||
        (auditLog.oldValues?.currentLocation as CurrentLocationData | undefined);

      const latitude = Number(locationData?.latitude);
      const longitude = Number(locationData?.longitude);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        continue;
      }

      timeline.push({
        timestamp: auditLog.createdAt.toISOString(),
        latitude,
        longitude,
        source: auditLog.source || 'SERVICE',
        action: auditLog.action,
        actor: auditLog.createdBy
          ? {
              id: auditLog.createdBy.id,
              name: auditLog.createdBy.name,
              email: auditLog.createdBy.email,
            }
          : undefined,
      });
    }

    return getPagingData({
      data: [timeline, total],
      page,
      size,
    });
  }
}
