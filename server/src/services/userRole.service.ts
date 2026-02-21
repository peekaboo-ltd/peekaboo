import { Repository } from "typeorm";
import { UserRole } from "../entities/userRole.entity";
import { AppDataSource } from "../data-source";
import { UserService } from "./user.service";
import { ValidationError } from "../helpers/errors.helper";
import { Role } from "../entities/role.entity";
import { RoleService } from "./role.service";
import { UUID } from "../types";
import { RoleTypes } from "../constants/role.constants";
import { User } from "../entities/user.entity";
import { AuditCreate } from "../decorators/auditLog.decorator";
import { AuditLogEntityTypes } from "../constants/auditLog.constants";

export class UserRoleService {
  private readonly userRoleRepository: Repository<UserRole>;
  private readonly roleService: RoleService;
  private readonly userRepository: Repository<User>;

  constructor() {
    this.userRoleRepository = AppDataSource.getRepository(UserRole);
    this.roleService = new RoleService();
    this.userRepository = AppDataSource.getRepository(User);
  }

  // CREATE USER ROLE
  @AuditCreate({
    entityType: AuditLogEntityTypes.USER_ROLE,
  })
  async createUserRole(userRole: Partial<UserRole>): Promise<UserRole> {
    if (!userRole?.userId || !userRole?.roleId) {
      throw new ValidationError("User ID and Role ID are required");
    }

    // CHECK IF USER EXISTS
    const user = await this.userRepository.findOne({
      where: {
        id: userRole?.userId,
      },
    });

    // CHECK IF ROLE EXISTS
    const role = await this.roleService.getRoleById(userRole?.roleId);

    // CHECK IF USER ROLE EXISTS
    const existingUserRole = await this.userRoleRepository.findOne({
      where: {
        userId: user?.id,
        roleId: role?.id,
      },
    });

    if (existingUserRole) {
      return existingUserRole;
    }

    return this.userRoleRepository.save(userRole);
  }

  // ASSIGN ROLES TO USER
  async assignRolesToUser(userId: UUID, roles: Partial<RoleTypes>[]): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    const rolesList = await this.roleService.getRolesByNames(roles);

    await Promise.all(
      rolesList.map((role) =>
        this.createUserRole({ userId: user?.id, roleId: role?.id })
      )
    );
  }
}
