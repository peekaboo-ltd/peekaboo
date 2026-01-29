import { FindOptionsWhere, Repository, ILike } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Organization } from '../entities/organization.entity';
import { OrganizationStatus } from '../constants/organization.constants';
import { UUID } from '../types';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../helpers/errors.helper';
import { getPagination, getPagingData, Pagination } from '../helpers/pagination.helper';
import { Request } from 'express';
import { OrganizationMembershipService } from './organizationMembership.service';
import { OrganizationRole } from '../constants/organization.constants';
import { hashPassword } from '../helpers/auth.helper';
import { UserService } from './user.service';
import { RoleTypes } from '../constants/role.constants';

export class OrganizationService {
  private readonly organizationRepository: Repository<Organization>;
  private readonly membershipService: OrganizationMembershipService;
  private readonly userService: UserService;

  constructor() {
    this.organizationRepository = AppDataSource.getRepository(Organization);
    this.membershipService = new OrganizationMembershipService();
    this.userService = new UserService();
  }

  // CREATE ORGANIZATION
  async createOrganization(data: {
    organization: Partial<Organization>;
    adminUser: {
      name?: string;
      email?: string;
      phoneNumber: string;
      password?: string;
    };
  }): Promise<{ organization: Organization; adminUserId: UUID }> {
    // Check TIN uniqueness if provided
    if (data.organization.tin) {
      const existingOrg = await this.organizationRepository.findOne({
        where: { tin: data.organization.tin },
      });

      if (existingOrg) {
        throw new ConflictError('Organization with this TIN already exists');
      }
    }

    // Create or get admin user
    let adminUser = await this.userService.getUserByCondition({
      phoneNumber: data.adminUser.phoneNumber,
    });

    if (adminUser) {
      // Check if user already has a membership
      const existingMembership = await this.membershipService.getMembershipByUserId(
        adminUser.id
      );
      if (existingMembership) {
        throw new ConflictError('User already belongs to an organization');
      }
    } else {
      // Create new admin user
      const userData: any = {
        phoneNumber: data.adminUser.phoneNumber,
        name: data.adminUser.name,
        email: data.adminUser.email,
      };

      if (data.adminUser.password) {
        userData.passwordHash = await hashPassword(data.adminUser.password);
      }

      adminUser = await this.userService.createUser(userData, [
        RoleTypes.BUSINESS,
      ]);
    }

    // Create organization
    const organization = await this.organizationRepository.save({
      name: data.organization.name,
      description: data.organization.description,
      email: data.organization.email,
      phoneNumber: data.organization.phoneNumber,
      address: data.organization.address,
      tin: data.organization.tin,
      businessPlanId: data.organization.businessPlanId,
      createdById: adminUser.id,
      status: OrganizationStatus.ACTIVE,
    });

    // Create admin membership
    await this.membershipService.addMember({
      organizationId: organization.id,
      user: {
        phoneNumber: adminUser.phoneNumber!,
        name: adminUser.name,
        email: adminUser.email,
      },
      role: OrganizationRole.ADMIN,
      addedById: adminUser.id,
    });

    return {
      organization,
      adminUserId: adminUser.id,
    };
  }

  // GET ORGANIZATION BY ID
  async getOrganizationById(id: UUID): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: {
        businessPlan: true,
        memberships: {
          user: {
            userRoles: {
              role: true,
            },
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    return organization;
  }

  // UPDATE ORGANIZATION
  async updateOrganization(
    id: UUID,
    data: Partial<Organization>
  ): Promise<Organization> {
    const organization = await this.getOrganizationById(id);

    // Check TIN uniqueness if updating
    if (data.tin && data.tin !== organization.tin) {
      const existingOrg = await this.organizationRepository.findOne({
        where: { tin: data.tin },
      });

      if (existingOrg) {
        throw new ConflictError('Organization with this TIN already exists');
      }
    }

    return this.organizationRepository.save({
      ...organization,
      ...data,
    });
  }

  // UPDATE ORGANIZATION STATUS
  async updateOrganizationStatus(
    id: UUID,
    status: OrganizationStatus
  ): Promise<Organization> {
    const organization = await this.getOrganizationById(id);
    organization.status = status;
    return this.organizationRepository.save(organization);
  }

  // ASSIGN BUSINESS PLAN
  async assignBusinessPlan(
    organizationId: UUID,
    businessPlanId: UUID | null
  ): Promise<Organization> {
    const organization = await this.getOrganizationById(organizationId);
    organization.businessPlanId = businessPlanId || undefined;
    return this.organizationRepository.save(organization);
  }

  // FETCH ORGANIZATIONS
  async fetchOrganizations(
    query: Request['query']
  ): Promise<Pagination<Organization>> {
    const { page = 0, size = 10, search, status, businessPlanId } = query;

    let condition: FindOptionsWhere<Organization> | FindOptionsWhere<Organization>[] = {};

    if (status) {
      condition.status = status as OrganizationStatus;
    }

    if (businessPlanId) {
      condition.businessPlanId = businessPlanId as UUID;
    }

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

    if (search) {
      // Use query builder for search
      const queryBuilder = this.organizationRepository
        .createQueryBuilder('organization')
        .leftJoinAndSelect('organization.businessPlan', 'businessPlan')
        .where(
          '(organization.name ILIKE :search OR organization.email ILIKE :search OR organization.tin ILIKE :search)',
          { search: `%${search}%` }
        );

      if (status) {
        queryBuilder.andWhere('organization.status = :status', { status });
      }

      if (businessPlanId) {
        queryBuilder.andWhere('organization.businessPlanId = :businessPlanId', {
          businessPlanId,
        });
      }

      queryBuilder.skip(skip).take(take).orderBy('organization.createdAt', 'DESC');

      const [organizations, total] = await queryBuilder.getManyAndCount();

      return getPagingData({
        data: [organizations, total],
        page: Number(page),
        size: Number(size),
      });
    }

    const organizations = await this.organizationRepository.findAndCount({
      where: condition,
      skip,
      take,
      relations: {
        businessPlan: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return getPagingData({
      data: organizations,
      page: Number(page),
      size: Number(size),
    });
  }

  // GET ORGANIZATION BY USER ID
  async getOrganizationByUserId(userId: UUID): Promise<Organization | null> {
    const membership = await this.membershipService.getMembershipByUserId(userId);
    return membership ? membership.organization : null;
  }

  // GET USER MEMBERSHIP
  async getUserMembership(userId: UUID) {
    return this.membershipService.getMembershipByUserId(userId);
  }
}
