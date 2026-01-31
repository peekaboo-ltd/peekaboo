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
import { BusinessPlanQuery } from '../types/b2b.types';
import { OrganizationStatus } from '../constants/organization.constants';

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
    query: BusinessPlanQuery
  ): Promise<Pagination<BusinessPlan & { organizationCount?: number }>> {
    const {
      page = 0,
      size = 10,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      startDate,
      endDate,
    } = query;

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

    // Use query builder for all queries to support sorting, date filtering, and organization count
    const queryBuilder = this.businessPlanRepository
      .createQueryBuilder('businessPlan')
      .loadRelationCountAndMap('businessPlan.organizationCount', 'businessPlan.organizations', 'org', (qb) =>
        qb.where('org.status = :orgStatus', { orgStatus: OrganizationStatus.ACTIVE })
      );

    if (search) {
      queryBuilder.where(
        '(businessPlan.name ILIKE :search OR businessPlan.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('businessPlan.status = :status', { status });
    }

    // Date range filtering
    if (startDate) {
      queryBuilder.andWhere('businessPlan.createdAt >= :startDate', {
        startDate: new Date(startDate as string),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('businessPlan.createdAt <= :endDate', {
        endDate: new Date(endDate as string),
      });
    }

    // Validate and apply sorting
    const allowedSortFields = ['createdAt', 'name', 'pricePerOrder', 'status', 'isDefault'];
    const sortField = allowedSortFields.includes(sortBy as string) ? sortBy : 'createdAt';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder
      .skip(skip)
      .take(take)
      .orderBy(`businessPlan.${sortField}`, order);

    const [businessPlans, total] = await queryBuilder.getManyAndCount();

    return getPagingData({
      data: [businessPlans, total],
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

  // GET ACTIVE PLANS WITH ORGANIZATION COUNT (for admin dashboard)
  async getActivePlansWithStats(): Promise<Array<BusinessPlan & { organizationCount: number }>> {
    const queryBuilder = this.businessPlanRepository
      .createQueryBuilder('businessPlan')
      .loadRelationCountAndMap('businessPlan.organizationCount', 'businessPlan.organizations', 'org', (qb) =>
        qb.where('org.status = :orgStatus', { orgStatus: OrganizationStatus.ACTIVE })
      )
      .where('businessPlan.status = :status', { status: BusinessPlanStatus.ACTIVE })
      .orderBy('businessPlan.name', 'ASC');

    return queryBuilder.getMany() as Promise<Array<BusinessPlan & { organizationCount: number }>>;
  }

  // GET AVAILABLE PLANS FOR BUSINESS USERS (public info only)
  async getAvailablePlansForBusiness(): Promise<Array<{
    id: UUID;
    name: string;
    description: string | null;
    pricePerOrder: number;
    currency: string;
    isDefault: boolean;
  }>> {
    const plans = await this.businessPlanRepository.find({
      where: {
        status: BusinessPlanStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        description: true,
        pricePerOrder: true,
        currency: true,
        isDefault: true,
      },
      order: {
        pricePerOrder: 'ASC',
      },
    });

    return plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description ?? null,
      pricePerOrder: Number(plan.pricePerOrder),
      currency: plan.currency,
      isDefault: plan.isDefault,
    }));
  }

  // GET ORGANIZATION COUNT FOR A PLAN
  async getOrganizationCountForPlan(planId: UUID): Promise<number> {
    const plan = await this.businessPlanRepository.findOne({
      where: { id: planId },
      relations: { organizations: true },
    });

    if (!plan) {
      throw new NotFoundError('Business plan not found');
    }

    return plan.organizations?.filter(org => org.status === OrganizationStatus.ACTIVE).length || 0;
  }
}
