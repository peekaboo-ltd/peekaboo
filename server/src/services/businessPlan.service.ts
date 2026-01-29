import { FindOptionsWhere, Repository, ILike } from 'typeorm';
import { AppDataSource } from '../data-source';
import { BusinessPlan } from '../entities/businessPlan.entity';
import { BusinessPlanStatus } from '../constants/businessPlan.constants';
import { UUID } from '../types';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../helpers/errors.helper';
import { getPagination, getPagingData, Pagination } from '../helpers/pagination.helper';
import { Request } from 'express';

export class BusinessPlanService {
  private readonly businessPlanRepository: Repository<BusinessPlan>;

  constructor() {
    this.businessPlanRepository = AppDataSource.getRepository(BusinessPlan);
  }

  // CREATE BUSINESS PLAN
  async createBusinessPlan(data: Partial<BusinessPlan>): Promise<BusinessPlan> {
    // Check name uniqueness
    if (data.name) {
      const existingPlan = await this.businessPlanRepository.findOne({
        where: { name: data.name },
      });

      if (existingPlan) {
        throw new ConflictError('Business plan with this name already exists');
      }
    }

    // If this plan is set as default, unset other defaults
    if (data.isDefault) {
      await this.businessPlanRepository.update(
        { isDefault: true },
        { isDefault: false }
      );
    }

    const businessPlan = await this.businessPlanRepository.save(data);
    return businessPlan;
  }

  // GET BUSINESS PLAN BY ID
  async getBusinessPlanById(id: UUID): Promise<BusinessPlan> {
    const businessPlan = await this.businessPlanRepository.findOne({
      where: { id },
      relations: {
        organizations: true,
      },
    });

    if (!businessPlan) {
      throw new NotFoundError('Business plan not found');
    }

    return businessPlan;
  }

  // UPDATE BUSINESS PLAN
  async updateBusinessPlan(
    id: UUID,
    data: Partial<BusinessPlan>
  ): Promise<BusinessPlan> {
    const businessPlan = await this.getBusinessPlanById(id);

    // Check name uniqueness if updating name
    if (data.name && data.name !== businessPlan.name) {
      const existingPlan = await this.businessPlanRepository.findOne({
        where: { name: data.name },
      });

      if (existingPlan) {
        throw new ConflictError('Business plan with this name already exists');
      }
    }

    // If setting as default, unset other defaults
    if (data.isDefault && !businessPlan.isDefault) {
      await this.businessPlanRepository.update(
        { isDefault: true },
        { isDefault: false }
      );
    }

    return this.businessPlanRepository.save({
      ...businessPlan,
      ...data,
    });
  }

  // DELETE BUSINESS PLAN (soft delete by archiving)
  async deleteBusinessPlan(id: UUID): Promise<void> {
    const businessPlan = await this.getBusinessPlanById(id);

    // Check if there are active organizations using this plan
    if (businessPlan.organizations && businessPlan.organizations.length > 0) {
      throw new ValidationError(
        'Cannot delete business plan with active organizations'
      );
    }

    // Archive the plan
    businessPlan.status = BusinessPlanStatus.ARCHIVED;
    await this.businessPlanRepository.save(businessPlan);
  }

  // FETCH BUSINESS PLANS
  async fetchBusinessPlans(
    query: Request['query']
  ): Promise<Pagination<BusinessPlan>> {
    const { page = 0, size = 10, search, status } = query;

    let condition: FindOptionsWhere<BusinessPlan> | FindOptionsWhere<BusinessPlan>[] = {};

    if (status) {
      condition.status = status as BusinessPlanStatus;
    }

    if (search) {
      condition.name = ILike(`%${search}%`);
    }

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

    const businessPlans = await this.businessPlanRepository.findAndCount({
      where: condition,
      skip,
      take,
      order: {
        createdAt: 'DESC',
      },
    });

    return getPagingData({
      data: businessPlans,
      page: Number(page),
      size: Number(size),
    });
  }

  // GET DEFAULT BUSINESS PLAN
  async getDefaultBusinessPlan(): Promise<BusinessPlan | null> {
    return this.businessPlanRepository.findOne({
      where: {
        isDefault: true,
        status: BusinessPlanStatus.ACTIVE,
      },
    });
  }

  // GET ACTIVE PLANS
  async getActivePlans(): Promise<BusinessPlan[]> {
    return this.businessPlanRepository.find({
      where: {
        status: BusinessPlanStatus.ACTIVE,
      },
      order: {
        name: 'ASC',
      },
    });
  }
}
