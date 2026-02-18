import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Batch } from '../entities/batch.entity';
import { UUID } from '../types';
import { generateReferenceNumber } from '../helpers/string.helper';
import { NotFoundError } from '../helpers/errors.helper';
import { LogReferenceTypes } from '../constants/logs.constants';

export class BatchService {
  private readonly batchRepository: Repository<Batch>;

  constructor() {
    this.batchRepository = AppDataSource.getRepository(Batch);
  }

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
}
