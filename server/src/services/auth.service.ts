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
import { validateAndFormatPhoneNumber } from '../helpers/phone.helper';

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
    // Try to normalize if it looks like a phone number
    let normalizedPhone: string | undefined;
    const phoneValidation = validateAndFormatPhoneNumber(username);
    if (phoneValidation.isValid) {
      normalizedPhone = phoneValidation.formattedNumber;
    }

    // Search by email OR original username OR normalized phone number
    const whereConditions: Array<{ email?: string; phoneNumber?: string }> = [
      { email: username },
      { phoneNumber: username },
    ];

    if (normalizedPhone && normalizedPhone !== username) {
      whereConditions.push({ phoneNumber: normalizedPhone });
    }

    const user = await this.userRepository.findOne({
      where: whereConditions,
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

    const isValidPassword = await comparePassword(
      password,
      user?.passwordHash!
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
    name?: string;
    email?: string;
    phoneNumber: string;
    password: string;
    roles: RoleTypes[];
  }): Promise<{
    user: User;
    token: string;
  }> {
    // Validate and format phone number
    const phoneValidation = validateAndFormatPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      throw new ValidationError(phoneValidation.error || 'Invalid phone number');
    }

    const formattedPhoneNumber = phoneValidation.formattedNumber!;

    // Check for existing user by phone number
    const existingUserByPhone = await this.userRepository.findOne({
      where: { phoneNumber: formattedPhoneNumber },
    });

    if (existingUserByPhone) {
      throw new ConflictError('User with this phone number already exists');
    }

    // Check for existing user by email if provided
    if (email) {
      const existingUserByEmail = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUserByEmail) {
        throw new ConflictError('User with this email already exists');
      }
    }

    // Validate password strength
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const hashedPassword = await hashPassword(password);

    const user = await this.userRepository.save({
      name,
      email,
      phoneNumber: formattedPhoneNumber,
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

  // FIND OR CREATE USER FROM GOOGLE PROFILE
  async findOrCreateFromGoogle({
    email,
    name,
    googleId,
  }: {
    email: string;
    name?: string;
    googleId: string;
  }): Promise<{
    user: User;
    token: string;
    isNewUser: boolean;
  }> {
    // Try to find existing user by email
    let user = await this.userRepository.findOne({
      where: { email },
      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    let isNewUser = false;

    if (!user) {
      // Create new user from Google profile
      user = await this.userRepository.save({
        email,
        name,
        googleId,
        status: UserStatus.ACTIVE,
      });

      // Assign default CUSTOMER role
      await this.userRoleService.assignRolesToUser(user.id, [RoleTypes.CUSTOMER]);
      isNewUser = true;

      // Reload user with roles
      user = await this.userRepository.findOne({
        where: { id: user.id },
        relations: {
          userRoles: {
            role: true,
          },
        },
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = googleId;
      await this.userRepository.save(user);
    }

    if (!user) {
      throw new NotFoundError('Failed to create or find user');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    return {
      user: { ...user, passwordHash: undefined },
      token,
      isNewUser,
    };
  }

  // ADD PHONE NUMBER TO USER (for Google auth users)
  async addPhoneNumber(
    userId: string,
    phoneNumber: string
  ): Promise<User> {
    // Validate and format phone number
    const phoneValidation = validateAndFormatPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      throw new ValidationError(phoneValidation.error || 'Invalid phone number');
    }

    const formattedPhoneNumber = phoneValidation.formattedNumber!;

    // Check if phone number already exists
    const existingUser = await this.userRepository.findOne({
      where: { phoneNumber: formattedPhoneNumber },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictError('Phone number already in use');
    }

    // Get current user
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update user with phone number
    user.phoneNumber = formattedPhoneNumber;
    const updatedUser = await this.userRepository.save(user);

    return { ...updatedUser, passwordHash: undefined };
  }
}
