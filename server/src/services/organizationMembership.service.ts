import { FindOptionsWhere, Repository, ILike } from 'typeorm';
import { AppDataSource } from '../data-source';
import { OrganizationMembership } from '../entities/organizationMembership.entity';
import {
  OrganizationRole,
  MembershipStatus,
} from '../constants/organization.constants';
import { UUID } from '../types';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  ForbiddenError,
} from '../helpers/errors.helper';
import { getPagination, getPagingData, Pagination } from '../helpers/pagination.helper';
import { UserService } from './user.service';
import { RoleTypes } from '../constants/role.constants';
import { hashPassword } from '../helpers/auth.helper';
import { MembershipQuery, MemberUpdateData } from '../types/b2b.types';
import { EmailService } from '../integrations/emails/email.service';

export class OrganizationMembershipService {
  private readonly membershipRepository: Repository<OrganizationMembership>;
  private readonly userService: UserService;
  private readonly emailService: EmailService;

  constructor() {
    this.membershipRepository = AppDataSource.getRepository(
      OrganizationMembership
    );
    this.userService = new UserService();
    this.emailService = new EmailService();
  }

  // ADD MEMBER
  async addMember(data: {
    organizationId: UUID;
    user: {
      name?: string;
      email?: string;
      phoneNumber: string;
      password?: string;
    };
    role?: OrganizationRole;
    addedById?: UUID;
  }): Promise<OrganizationMembership> {
    // Try to find user by phone number
    let user = await this.userService.getUserByCondition({
      phoneNumber: data.user.phoneNumber,
    });

    if (user) {
      // Check if user already has a membership
      const existingUserMembership = await this.membershipRepository.findOne({
        where: { userId: user.id },
      });

      if (existingUserMembership) {
        throw new ConflictError('User already belongs to an organization');
      }
    } else {
      // Create new user
      const userData: any = {
        phoneNumber: data.user.phoneNumber,
        name: data.user.name,
        email: data.user.email,
      };

      if (data.user.password) {
        userData.passwordHash = await hashPassword(data.user.password);
      }

      user = await this.userService.createUser(userData, [RoleTypes.BUSINESS]);
    }

    // Create membership
    const membership = await this.membershipRepository.save({
      userId: user.id,
      organizationId: data.organizationId,
      role: data.role || OrganizationRole.MEMBER,
      status: MembershipStatus.ACTIVE,
      addedById: data.addedById,
    });

    const fullMembership = await this.getMembershipById(membership.id);

    // Send member added email (non-blocking)
    if (user.email && fullMembership.organization) {
      this.emailService
        .sendMemberAddedEmail({
          organizationName: fullMembership.organization.name,
          memberName: user.name || '',
          memberEmail: user.email,
          role: data.role || OrganizationRole.MEMBER,
        })
        .catch(() => {});
    }

    return fullMembership;
  }



  // CREATE MEMBERSHIP FOR AN EXISTING USER
  async createMembershipForUser(data: {
    userId: UUID;
    organizationId: UUID;
    role?: OrganizationRole;
    status?: MembershipStatus;
    addedById?: UUID;
  }): Promise<OrganizationMembership> {
    const existingUserMembership = await this.membershipRepository.findOne({
      where: { userId: data.userId },
    });

    if (existingUserMembership) {
      throw new ConflictError('User already belongs to an organization');
    }

    const membership = await this.membershipRepository.save({
      userId: data.userId,
      organizationId: data.organizationId,
      role: data.role || OrganizationRole.MEMBER,
      status: data.status || MembershipStatus.ACTIVE,
      addedById: data.addedById,
    });

    return this.getMembershipById(membership.id);
  }
  // GET MEMBERSHIP BY ID
  async getMembershipById(id: UUID): Promise<OrganizationMembership> {
    const membership = await this.membershipRepository.findOne({
      where: { id },
      relations: {
        user: {
          userRoles: {
            role: true,
          },
        },
        organization: true,
        addedBy: true,
      },
    });

    if (!membership) {
      throw new NotFoundError('Membership not found');
    }

    return membership;
  }

  // UPDATE MEMBER ROLE
  async updateMemberRole(
    membershipId: UUID,
    role: OrganizationRole,
    updatedById: UUID
  ): Promise<OrganizationMembership> {
    const membership = await this.getMembershipById(membershipId);

    // Check if this is the last admin
    if (
      membership.role === OrganizationRole.ADMIN &&
      role !== OrganizationRole.ADMIN
    ) {
      const adminCount = await this.membershipRepository.count({
        where: {
          organizationId: membership.organizationId,
          role: OrganizationRole.ADMIN,
          status: MembershipStatus.ACTIVE,
        },
      });

      if (adminCount <= 1) {
        throw new ValidationError(
          'Cannot change role. Organization must have at least one admin'
        );
      }
    }

    const oldRole = membership.role;
    membership.role = role;
    const updated = await this.membershipRepository.save(membership);

    // Send role changed email (non-blocking)
    if (membership.user?.email && membership.organization) {
      this.emailService
        .sendMemberRoleChangedEmail({
          organizationName: membership.organization.name,
          memberName: membership.user.name || '',
          memberEmail: membership.user.email,
          oldRole,
          newRole: role,
          changedBy: 'Organization Admin',
        })
        .catch(() => {});
    }

    return updated;
  }

  // REMOVE MEMBER
  async removeMember(
    membershipId: UUID,
    removedById: UUID
  ): Promise<void> {
    const membership = await this.getMembershipById(membershipId);

    // Prevent self-removal
    if (membership.userId === removedById) {
      throw new ValidationError('You cannot remove yourself from the organization');
    }

    // Check if this is the last admin
    if (membership.role === OrganizationRole.ADMIN) {
      const adminCount = await this.membershipRepository.count({
        where: {
          organizationId: membership.organizationId,
          role: OrganizationRole.ADMIN,
          status: MembershipStatus.ACTIVE,
        },
      });

      if (adminCount <= 1) {
        throw new ValidationError(
          'Cannot remove the last admin from the organization'
        );
      }
    }

    // Soft delete by setting status to REMOVED
    membership.status = MembershipStatus.REMOVED;
    await this.membershipRepository.save(membership);

    // Send member removed email (non-blocking)
    if (membership.user?.email && membership.organization) {
      this.emailService
        .sendMemberRemovedEmail({
          organizationName: membership.organization.name,
          memberName: membership.user.name || '',
          memberEmail: membership.user.email,
        })
        .catch(() => {});
    }
  }

  // UPDATE MEMBER DETAILS
  async updateMemberDetails(
    membershipId: UUID,
    data: MemberUpdateData,
    updatedById: UUID
  ): Promise<OrganizationMembership> {
    const membership = await this.getMembershipById(membershipId);

    if (!membership.user) {
      throw new NotFoundError('User not found');
    }

    // Update user details
    if (data.name !== undefined) {
      membership.user.name = data.name;
    }
    if (data.email !== undefined) {
      membership.user.email = data.email;
    }

    await this.userService.updateUser(membership.userId, {
      name: data.name,
      email: data.email,
    });

    return this.getMembershipById(membershipId);
  }

  // REACTIVATE MEMBER
  async reactivateMember(
    membershipId: UUID,
    reactivatedById: UUID
  ): Promise<OrganizationMembership> {
    const membership = await this.membershipRepository.findOne({
      where: { id: membershipId },
      relations: {
        user: true,
        organization: true,
      },
    });

    if (!membership) {
      throw new NotFoundError('Membership not found');
    }

    if (membership.status === MembershipStatus.ACTIVE) {
      throw new ValidationError('Member is already active');
    }

    // Check if user has another active membership
    const existingActiveMembership = await this.membershipRepository.findOne({
      where: {
        userId: membership.userId,
        status: MembershipStatus.ACTIVE,
      },
    });

    if (existingActiveMembership) {
      throw new ConflictError('User already belongs to another organization');
    }

    membership.status = MembershipStatus.ACTIVE;
    await this.membershipRepository.save(membership);

    return this.getMembershipById(membershipId);
  }

  // GET MEMBER COUNT FOR ORGANIZATION
  async getMemberCount(
    organizationId: UUID,
    status: MembershipStatus = MembershipStatus.ACTIVE
  ): Promise<number> {
    return this.membershipRepository.count({
      where: {
        organizationId,
        status,
      },
    });
  }

  // GET ORGANIZATION MEMBERS
  async getOrganizationMembers(
    organizationId: UUID,
    query: MembershipQuery
  ): Promise<Pagination<OrganizationMembership>> {
    const {
      page = 0,
      size = 10,
      search,
      role,
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

    const queryBuilder = this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.user', 'user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('membership.addedBy', 'addedBy')
      .where('membership.organizationId = :organizationId', { organizationId });

    if (search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search OR user.phoneNumber ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (role) {
      queryBuilder.andWhere('membership.role = :role', { role });
    }

    if (status) {
      queryBuilder.andWhere('membership.status = :status', { status });
    } else {
      // By default, only show active memberships
      queryBuilder.andWhere('membership.status = :status', {
        status: MembershipStatus.ACTIVE,
      });
    }

    // Date range filtering
    if (startDate) {
      queryBuilder.andWhere('membership.createdAt >= :startDate', {
        startDate: new Date(startDate as string),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('membership.createdAt <= :endDate', {
        endDate: new Date(endDate as string),
      });
    }

    // Validate and apply sorting
    const allowedSortFields = ['createdAt', 'role', 'status'];
    const userSortFields = ['name', 'email'];
    const sortField = sortBy as string;
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    if (userSortFields.includes(sortField)) {
      queryBuilder.orderBy(`user.${sortField}`, order);
    } else if (allowedSortFields.includes(sortField)) {
      queryBuilder.orderBy(`membership.${sortField}`, order);
    } else {
      queryBuilder.orderBy('membership.createdAt', order);
    }

    queryBuilder.skip(skip).take(take);

    const [memberships, total] = await queryBuilder.getManyAndCount();

    return getPagingData({
      data: [memberships, total],
      page: Number(page),
      size: Number(size),
    });
  }

  // IS ORGANIZATION ADMIN
  async isOrganizationAdmin(
    userId: UUID,
    organizationId: UUID
  ): Promise<boolean> {
    const membership = await this.membershipRepository.findOne({
      where: {
        userId,
        organizationId,
        role: OrganizationRole.ADMIN,
        status: MembershipStatus.ACTIVE,
      },
    });

    return !!membership;
  }

  // GET MEMBERSHIP BY USER ID
  async getMembershipByUserId(userId: UUID): Promise<OrganizationMembership | null> {
    return this.membershipRepository.findOne({
      where: {
        userId,
        status: MembershipStatus.ACTIVE,
      },
      relations: {
        organization: {
          businessPlan: true,
        },
        user: true,
      },
    });
  }
}
