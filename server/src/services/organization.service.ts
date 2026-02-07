import { FindOptionsWhere, Repository, ILike, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Organization } from '../entities/organization.entity';
import { OrganizationStatus, MembershipStatus } from '../constants/organization.constants';
import { UUID } from '../types';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../helpers/errors.helper';
import { getPagination, getPagingData, Pagination } from '../helpers/pagination.helper';
import { OrganizationMembershipService } from './organizationMembership.service';
import { OrganizationRole } from '../constants/organization.constants';
import { hashPassword } from '../helpers/auth.helper';
import { UserService } from './user.service';
import { RoleTypes } from '../constants/role.constants';
import { OrganizationQuery, OrganizationStatistics } from '../types/b2b.types';
import { OrganizationMembership } from '../entities/organizationMembership.entity';
import jwt from 'jsonwebtoken';
import { EmailService } from '../integrations/emails/email.service';

export class OrganizationService {
  private readonly organizationRepository: Repository<Organization>;
  private readonly membershipService: OrganizationMembershipService;
  private readonly userService: UserService;
  private readonly emailService: EmailService;

  constructor() {
    this.organizationRepository = AppDataSource.getRepository(Organization);
    this.membershipService = new OrganizationMembershipService();
    this.userService = new UserService();
    this.emailService = new EmailService();
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
    query: OrganizationQuery
  ): Promise<Pagination<Organization & { memberCount?: number }>> {
    const {
      page = 0,
      size = 10,
      search,
      status,
      businessPlanId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      startDate,
      endDate,
    } = query;

    const { take, skip } = getPagination({
      page: Number(page),
      size: Number(size),
    });

    // Use query builder for all queries to support sorting, date filtering, and member count
    const queryBuilder = this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.businessPlan', 'businessPlan')
      .loadRelationCountAndMap('organization.memberCount', 'organization.memberships', 'membership', (qb) =>
        qb.where('membership.status = :memberStatus', { memberStatus: MembershipStatus.ACTIVE })
      );

    if (search) {
      queryBuilder.where(
        '(organization.name ILIKE :search OR organization.email ILIKE :search OR organization.tin ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('organization.status = :status', { status });
    }

    if (businessPlanId) {
      queryBuilder.andWhere('organization.businessPlanId = :businessPlanId', {
        businessPlanId,
      });
    }

    // Date range filtering
    if (startDate) {
      queryBuilder.andWhere('organization.createdAt >= :startDate', {
        startDate: new Date(startDate as string),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('organization.createdAt <= :endDate', {
        endDate: new Date(endDate as string),
      });
    }

    // Validate and apply sorting
    const allowedSortFields = ['createdAt', 'name', 'email', 'status'];
    const sortField = allowedSortFields.includes(sortBy as string) ? sortBy : 'createdAt';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder
      .skip(skip)
      .take(take)
      .orderBy(`organization.${sortField}`, order);

    const [organizations, total] = await queryBuilder.getManyAndCount();

    return getPagingData({
      data: [organizations, total],
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

  // GET ORGANIZATION STATISTICS
  async getOrganizationStatistics(organizationId: UUID): Promise<OrganizationStatistics> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
      relations: {
        businessPlan: true,
        memberships: true,
        orders: true,
        billingRecords: true,
      },
    });

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    const totalMembers = organization.memberships?.length || 0;
    const activeMembers = organization.memberships?.filter(
      (m) => m.status === MembershipStatus.ACTIVE
    ).length || 0;
    const totalOrders = organization.orders?.length || 0;

    // Calculate total spent from completed billing records
    const totalSpent = organization.billingRecords
      ?.filter((b) => b.status === 'PAID')
      .reduce((sum, b) => sum + Number(b.totalAmount), 0) || 0;

    // Calculate pending billing
    const pendingBilling = organization.billingRecords
      ?.filter((b) => b.status === 'PENDING' || b.status === 'INVOICED')
      .reduce((sum, b) => sum + Number(b.totalAmount), 0) || 0;

    return {
      totalMembers,
      activeMembers,
      totalOrders,
      totalSpent,
      pendingBilling,
      currentPlan: organization.businessPlan
        ? {
            id: organization.businessPlan.id,
            name: organization.businessPlan.name,
            pricePerOrder: Number(organization.businessPlan.pricePerOrder),
          }
        : null,
    };
  }

  // GET TOTAL ORGANIZATION COUNT
  async getTotalOrganizationCount(status?: OrganizationStatus): Promise<number> {
    const where: FindOptionsWhere<Organization> = {};
    if (status) {
      where.status = status;
    }
    return this.organizationRepository.count({ where });
  }

  // CONTACT INQUIRY (from landing page)
  async submitContactInquiry(data: {
    contactName: string;
    contactEmail: string;
    companyName: string;
    phoneNumber?: string;
    message?: string;
  }): Promise<void> {
    await this.emailService.sendOrganizationInquiryNotification(data);
  }

  // ADMIN: INVITE ORGANIZATION (manual onboarding)
  async inviteOrganization(data: {
    name: string;
    email: string;
    adminName: string;
    adminEmail: string;
    phoneNumber?: string;
    address?: string;
  }, createdById: UUID): Promise<{ organization: Organization; inviteToken: string }> {
    // Check if an org with this email already exists
    const existingOrg = await this.organizationRepository.findOne({
      where: { email: data.email },
    });
    if (existingOrg) {
      throw new ConflictError('An organization with this email already exists');
    }

    // Check if admin user already exists by email
    let adminUser = await this.userService.getUserByCondition({
      email: data.adminEmail,
    });

    if (adminUser) {
      const existingMembership = await this.membershipService.getMembershipByUserId(
        adminUser.id
      );
      if (existingMembership) {
        throw new ConflictError('This user already belongs to an organization');
      }
    } else {
      // Create admin user without password (they'll set it during onboarding completion)
      adminUser = await this.userService.createUser(
        {
          name: data.adminName,
          email: data.adminEmail,
        },
        [RoleTypes.BUSINESS]
      );
    }

    // Create organization with PENDING status
    const organization = await this.organizationRepository.save({
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
      createdById,
      status: OrganizationStatus.PENDING,
    });

    // Create admin membership
    await this.membershipService.addMember({
      organizationId: organization.id,
      user: {
        phoneNumber: adminUser.phoneNumber || '',
        name: adminUser.name,
        email: adminUser.email,
      },
      role: OrganizationRole.ADMIN,
      addedById: createdById,
    });

    // Generate invite token (JWT valid for 7 days)
    const inviteToken = jwt.sign(
      {
        organizationId: organization.id,
        adminUserId: adminUser.id,
        type: 'org_onboarding',
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    // Send invite email
    await this.emailService.sendOnboardingInviteEmail({
      to: data.adminEmail,
      organizationName: data.name,
      adminName: data.adminName,
      inviteToken,
    });

    return { organization, inviteToken };
  }

  // VALIDATE ONBOARDING TOKEN
  async validateOnboardingToken(token: string): Promise<{
    organizationId: UUID;
    adminUserId: UUID;
    organization: Organization;
  }> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default_secret'
      ) as { organizationId: UUID; adminUserId: UUID; type: string };

      if (decoded.type !== 'org_onboarding') {
        throw new ValidationError('Invalid token type');
      }

      const organization = await this.organizationRepository.findOne({
        where: { id: decoded.organizationId },
      });

      if (!organization) {
        throw new NotFoundError('Organization not found');
      }

      if (organization.status !== OrganizationStatus.PENDING) {
        throw new ValidationError('Organization has already been onboarded');
      }

      return {
        organizationId: decoded.organizationId,
        adminUserId: decoded.adminUserId,
        organization,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Invalid or expired onboarding token');
    }
  }

  // COMPLETE ONBOARDING (org admin sets password and activates account)
  async completeOnboarding(data: {
    token: string;
    password: string;
    phoneNumber: string;
    adminName?: string;
    organizationDetails?: {
      address?: string;
      description?: string;
      phoneNumber?: string;
    };
  }): Promise<{ organization: Organization; adminUserId: UUID }> {
    const { organizationId, adminUserId } = await this.validateOnboardingToken(data.token);

    // Update admin user with password and phone
    const passwordHash = await hashPassword(data.password);
    const adminUser = await this.userService.getUserById(adminUserId);
    if (!adminUser) {
      throw new NotFoundError('Admin user not found');
    }

    await this.userService.updateUser(adminUserId, {
      passwordHash,
      phoneNumber: data.phoneNumber,
      ...(data.adminName && { name: data.adminName }),
    });

    // Update organization details if provided
    const orgUpdate: Partial<Organization> = {
      status: OrganizationStatus.ACTIVE,
    };
    if (data.organizationDetails?.address) {
      orgUpdate.address = data.organizationDetails.address;
    }
    if (data.organizationDetails?.description) {
      orgUpdate.description = data.organizationDetails.description;
    }
    if (data.organizationDetails?.phoneNumber) {
      orgUpdate.phoneNumber = data.organizationDetails.phoneNumber;
    }

    const organization = await this.organizationRepository.save({
      id: organizationId,
      ...orgUpdate,
    });

    // Send confirmation email
    await this.emailService.sendOnboardingCompleteEmail({
      to: adminUser.email!,
      organizationName: organization.name,
      adminName: adminUser.name || 'Admin',
    });

    return { organization, adminUserId };
  }
}
