import { FindOptionsWhere, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";
import { UUID } from "../types";
import { LogReferenceTypes } from "../constants/logs.constants";
import { NotFoundError, ValidationError } from "../helpers/errors.helper";
import { UserRoleService } from "./userRole.service";
import { RoleTypes } from "../constants/role.constants";
import { getPagingData } from "../helpers/pagination.helper";
import { Pagination } from "../helpers/pagination.helper";
import { getPagination } from "../helpers/pagination.helper";

export class UserService {
  private readonly userRepository: Repository<User>;
  private readonly userRoleService: UserRoleService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.userRoleService = new UserRoleService(this);
  }

  // GET USER BY ID
  async getUserById(id: UUID): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundError("User not found", {
        referenceId: id,
        referenceType: LogReferenceTypes.USER,
      });
    }

    return user;
  }

  // GET USER BY CONDITION
  async getUserByCondition(
    condition: FindOptionsWhere<User> | FindOptionsWhere<User>[]
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: condition,
      relations: {
        userRoles: {
          role: true,
        },
        assignments: true,
      },
    });
    return user;
  }

  // CREATE USER
  async createUser(
    user: Partial<User>,
    roles?: Partial<RoleTypes>[]
  ): Promise<User> {
    if (!user?.phoneNumber) {
      throw new ValidationError("Phone number is required");
    }

    // CHECK IF USER EXISTS
    const existingUser = await this.userRepository.findOne({
      where: { phoneNumber: user?.phoneNumber },
    });

    if (existingUser) {
      return existingUser;
    }

    const createdUser = await this.userRepository.save(user);

    if (roles && roles.length > 0) {
      await this.userRoleService.assignRolesToUser(createdUser?.id, roles);
    }
    return createdUser;
  }

  // UPDATE USER
  async updateUser(id: UUID, user: Partial<User>): Promise<User> {
    const userExists = await this.getUserById(id);

    return this.userRepository.save({
      ...userExists,
      ...user,
    });
  }

  // FETCH USERS
  async fetchUsers({
    page,
    size,
    condition,
    relations = ["userRoles.role"],
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<User> | FindOptionsWhere<User>[];
    relations?: string[];
  }): Promise<Pagination<User>> {
    // GET PAGINATION
    const { take, skip } = getPagination({ page, size });

    const users = await this.userRepository.findAndCount({
      where: condition,
      skip,
      take,
      relations,
    });

    return getPagingData({
      data: users,
      page,
      size,
    });
  }
}
