import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../data-source';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../helpers/errors.helper';
import { UserStatus } from '../constants/user.constants';
import { comparePassword, hashPassword } from '../helpers/auth.helper';
import jwt from 'jsonwebtoken';
import { RoleTypes } from '../constants/role.constants';
import { UserRoleService } from './userRole.service';
import { UserService } from './user.service';

export class AuthService {
  private readonly userRepository: Repository<User>;
  private readonly userRoleService: UserRoleService;
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.userRoleService = new UserRoleService();
  }

  // LOGIN
  async login({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<{
    user: User;
    token: string;
  }> {
    const user = await this.userRepository.findOne({
      where: [{ email: username }, { phoneNumber: username }],
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        status: true,
        passwordHash: true,
        userRoles: {
          id: true,
          role: {
            id: true,
            name: true,
          },
        },
      },
      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Username or password is incorrect');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new NotFoundError('Account is not active');
    }

    if (!user.passwordHash) {
      throw new ValidationError('User account is not properly configured. Please contact support.');
    }

    const isValidPassword = await comparePassword(
      password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new NotFoundError('Username or password is incorrect');
    }

    // GENERATE TOKEN
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    return { user: { ...user, passwordHash: undefined }, token };
  }

  // REGISTER
  async register({
    name,
    email,
    phoneNumber,
    password,
    roles,
  }: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    roles: RoleTypes[];
  }): Promise<{
    user: User;
    token: string;
  }> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      throw new ConflictError(
        'User with this email or phone number already exists'
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await this.userRepository.save({
      name,
      email,
      phoneNumber,
      passwordHash: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    await this.userRoleService.assignRolesToUser(user.id, roles);

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    const userWithRoles = await this.userRepository.findOne({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        status: true,
        passwordHash: true,
        userRoles: {
          id: true,
          role: {
            id: true,
            name: true,
          },
        },
      },
      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    // Add null safety checks for userWithRoles and its properties
    if (!userWithRoles) {
      return { user: { ...user, passwordHash: undefined }, token };
    }

    const safeUser = {
      ...userWithRoles,
      passwordHash: undefined,
      phoneNumber: userWithRoles.phoneNumber ?? '',
    };

    return { user: safeUser, token };
  }
}
