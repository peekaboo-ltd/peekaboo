import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Batch } from '../entities/batch.entity';
import { Order } from '../entities/order.entity';
import { OrderActivity } from '../entities/orderActivity.entity';
import { UUID } from '../types';
import { generateReferenceNumber } from '../helpers/string.helper';
import { NotFoundError, ValidationError } from '../helpers/errors.helper';
import { LogReferenceTypes } from '../constants/logs.constants';
import { BatchStatus } from '../constants/batch.constants';
import { OrderActivityStatus, OrderStatus } from '../constants/order.constants';
import { validateAndFormatPhoneNumber } from '../helpers/phone.helper';
import { AuditCreate, AuditUpdate } from '../decorators/auditLog.decorator';
import { AuditLogEntityTypes } from '../constants/auditLog.constants';

export class BatchService {
  private readonly batchRepository: Repository<Batch>;

  constructor() {
    this.batchRepository = AppDataSource.getRepository(Batch);
  }

  // Alias for audit decorators
  async getEntityById(id: UUID): Promise<Batch> {
    return this.getBatchById(id);
  }

  @AuditCreate({
    entityType: AuditLogEntityTypes.BATCH,
    getUserId: (args) => args[0]?.createdById,
  })
  async createBatch(data: {
    name?: string;
    description?: string;
    createdById: UUID;
  }): Promise<Batch> {
    let referenceId = generateReferenceNumber({
      prefix: 'B',
      length: 6,
    });

    while (await this.batchRepository.findOne({ where: { referenceId } })) {
      referenceId = generateReferenceNumber({
        prefix: 'B',
        length: 6,
      });
    }

    return this.batchRepository.save({
      ...data,
      referenceId,
    });
  }

  async getBatchById(id: UUID): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { id },
      relations: {
        createdBy: true,
        orders: true,
      },
    });

    if (!batch) {
      throw new NotFoundError('Batch not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.BATCH,
      });
    }

    return batch;
  }

  async listBatches(userId: UUID, isAdmin: boolean): Promise<Batch[]> {
    const where = isAdmin ? {} : { createdById: userId };
    return this.batchRepository.find({
      where,
      relations: {
        createdBy: true,
        orders: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getBatchOrders(batchId: UUID, userId: UUID, isAdmin?: boolean): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
      relations: {
        createdBy: true,
        orders: {
          recipient: true,
          sender: true,
        },
      },
    });

    if (!batch) {
      throw new NotFoundError('Batch not found', {
        referenceId: batchId,
        referenceType: LogReferenceTypes.BATCH,
      });
    }

    if (!isAdmin && batch?.createdById !== userId) {
      // Allow admin to view any batch — caller should pass their id; admin check done in controller
      throw new NotFoundError('Batch not found', {
        referenceId: batchId,
        referenceType: LogReferenceTypes.BATCH,
      });
    }

    return batch;
  }

  @AuditUpdate({
    entityType: AuditLogEntityTypes.BATCH,
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1],
  })
  async completeBatch(batchId: UUID, userId: UUID, isAdmin: boolean = false): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
      relations: { orders: { recipient: true } },
    });

    if (!batch) {
      throw new NotFoundError('Batch not found', {
        referenceId: batchId,
        referenceType: LogReferenceTypes.BATCH,
      });
    }

    if (!isAdmin && batch.createdById !== userId) {
      throw new NotFoundError('Batch not found', {
        referenceId: batchId,
        referenceType: LogReferenceTypes.BATCH,
      });
    }

    if (batch.status !== BatchStatus.DRAFT) {
      throw new ValidationError('Only DRAFT batches can be completed');
    }

    const draftOrders = batch.orders?.filter(
      (o) => o.status === OrderStatus.DRAFT,
    ) || [];

    const validationErrors: Array<{ orderId: UUID; referenceId: string; field: string; message: string }> = [];
    const hasDeliveryLocation = (order: Order) => {
      const latitude = Number(order.locationTo?.latitude);
      const longitude = Number(order.locationTo?.longitude);

      return (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
      );
    };

    for (const order of draftOrders) {
      const recipientPhone = order.recipient?.phoneNumber || '';
      const phoneResult = validateAndFormatPhoneNumber(recipientPhone);
      if (!phoneResult.isValid) {
        validationErrors.push({
          orderId: order.id,
          referenceId: order.referenceId,
          field: 'recipientPhoneNumber',
          message: phoneResult.error || 'Invalid recipient phone number',
        });
      }

      if (!hasDeliveryLocation(order)) {
        validationErrors.push({
          orderId: order.id,
          referenceId: order.referenceId,
          field: 'deliveryLocation',
          message: 'Delivery location is required',
        });
      }
    }

    if (validationErrors.length > 0) {
      throw new ValidationError('Batch validation failed. Fix errors before completing.', {
        referenceType: LogReferenceTypes.BATCH,
        referenceId: batchId,
        errors: validationErrors,
      } as any);
    }

    await AppDataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const orderActivityRepository = manager.getRepository(OrderActivity);
      const batchRepo = manager.getRepository(Batch);

      for (const order of draftOrders) {
        await orderRepository.update(order.id, { status: OrderStatus.PENDING });
        await orderActivityRepository.save(
          orderActivityRepository.create({
            orderId: order.id,
            status: OrderActivityStatus.PENDING,
            createdById: userId,
          }),
        );
      }

      await batchRepo.update(batchId, { status: BatchStatus.PENDING });
    });

    const updated = await this.getBatchById(batchId);
    return updated;
  }
}
