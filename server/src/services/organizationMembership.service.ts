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
import { Request } from 'express';
import { UserService } from './user.service';
import { RoleTypes } from '../constants/role.constants';
import { hashPassword } from '../helpers/auth.helper';

export class OrganizationMembershipService {
  private readonly membershipRepository: Repository<OrganizationMembership>;
  private readonly userService: UserService;

  constructor() {
    this.membershipRepository = AppDataSource.getRepository(
      OrganizationMembership
    );
    this.userService = new UserService();
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

    membership.role = role;
    return this.membershipRepository.save(membership);
  }

  // REMOVE MEMBER
  async removeMember(
    membershipId: UUID,
    removedById: UUID
  ): Promise<void> {
    const membership = await this.getMembershipById(membershipId);

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
  }

  // GET ORGANIZATION MEMBERS
  async getOrganizationMembers(
    organizationId: UUID,
    query: Request['query']
  ): Promise<Pagination<OrganizationMembership>> {
    const { page = 0, size = 10, search, role, status } = query;

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

    queryBuilder.skip(skip).take(take).orderBy('membership.createdAt', 'DESC');

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
