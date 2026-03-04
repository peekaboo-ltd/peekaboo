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
import { UUID } from '../types';
import { EmailService } from '../integrations/emails/email.service';
import { UserRole } from '../entities/userRole.entity';

const PASSWORD_RESET_TOKEN_EXPIRY = '30m';

export class AuthService {
  private readonly userRepository: Repository<User>;
  private readonly userRoleRepository: Repository<UserRole>;
  private readonly userRoleService: UserRoleService;
  private readonly emailService: EmailService;
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.userRoleRepository = AppDataSource.getRepository(UserRole);
    this.userRoleService = new UserRoleService();
    this.emailService = new EmailService();
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
        name: true,
        dateOfBirth: true,
        status: true,
        passwordHash: true,
        userRoles: {
          id: true,
          role: {
            id: true,
            name: true,
          },
        },
        organizationMembership: {
          id: true,
          status: true,
          organizationId: true,
          organization: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        }
      },
      relations: {
        userRoles: {
          role: true,
        },
        organizationMembership: {
          organization: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Username or password is incorrect');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new NotFoundError('Account is not active');
    }

    // Check if user has a password (OAuth-only users don't have passwordHash)
    if (!user.passwordHash) {
      throw new NotFoundError('Username or password is incorrect');
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

    // Send welcome email (non-blocking)
    if (email) {
      this.emailService
        .sendWelcomeEmail(email, name || '')
        .catch(() => {});
    }

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
    // Search by googleId first (primary identifier for OAuth users)
    let user = await this.userRepository.findOne({
      where: { googleId },
      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    let isNewUser = false;

    if (user) {
      // User found by googleId - update email if it has changed
      if (user.email !== email) {
        user.email = email;
        await this.userRepository.save(user);
      }
      // Update name if provided and different
      if (name && user.name !== name) {
        user.name = name;
        await this.userRepository.save(user);
      }
    } else {
      // Not found by googleId - try to find by email (for linking existing accounts)
      user = await this.userRepository.findOne({
        where: { email },
        relations: {
          userRoles: {
            role: true,
          },
        },
      });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        await this.userRepository.save(user);
      } else {
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
      }
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

    // Send OAuth welcome email for new users (non-blocking)
    if (isNewUser && email) {
      const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      this.emailService
        .sendOAuthWelcomeEmail({
          name: name || '',
          email,
          provider: 'Google',
          dashboardUrl: `${baseUrl}/dashboard`,
        })
        .catch(() => {});
    }

    return {
      user: { ...user, passwordHash: undefined },
      token,
      isNewUser,
    };
  }

  // ADD PHONE NUMBER TO USER (for Google auth users)
  async addPhoneNumber(
    userId: UUID,
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

  async requestPasswordReset(identifier: string): Promise<void> {
    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      throw new ValidationError('Email or phone number is required');
    }

    let normalizedPhone: string | undefined;
    const phoneValidation = validateAndFormatPhoneNumber(trimmedIdentifier);
    if (phoneValidation.isValid) {
      normalizedPhone = phoneValidation.formattedNumber;
    }

    const whereConditions: Array<{ email?: string; phoneNumber?: string }> = [
      { email: trimmedIdentifier },
      { phoneNumber: trimmedIdentifier },
    ];

    if (normalizedPhone && normalizedPhone !== trimmedIdentifier) {
      whereConditions.push({ phoneNumber: normalizedPhone });
    }

    const user = await this.userRepository.findOne({
      where: whereConditions,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      },
    });

    if (!user || !user.email || user.status !== UserStatus.ACTIVE) {
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        purpose: 'password-reset',
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: PASSWORD_RESET_TOKEN_EXPIRY }
    );

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

    await this.emailService.sendPasswordResetLinkEmail({
      name: user.name || 'there',
      email: user.email,
      resetUrl,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!token) {
      throw new ValidationError('Password reset token is required');
    }

    if (!newPassword || newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    let payload: { id: UUID; purpose?: string };
    try {
      payload = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default_secret'
      ) as { id: UUID; purpose?: string };
    } catch {
      throw new ValidationError('Invalid or expired password reset token');
    }

    if (payload.purpose !== 'password-reset') {
      throw new ValidationError('Invalid or expired password reset token');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new NotFoundError('User not found');
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.userRepository.update(user.id, { passwordHash: hashedPassword });

    if (user.email) {
      await this.emailService.sendPasswordChangedEmail({
        name: user.name || 'there',
        email: user.email,
      });
    }
  }

  async changePassword(
    userId: UUID,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    if (!oldPassword || !newPassword) {
      throw new ValidationError('Old password and new password are required');
    }

    if (newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const hasLower = /[a-z]/.test(newPassword);
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    if (!hasLower || !hasUpper || !hasNumber || !hasSpecial) {
      throw new ValidationError(
        'Password must include uppercase, lowercase, a number, and a symbol'
      );
    }

    if (oldPassword === newPassword) {
      throw new ValidationError('New password must be different from old password');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        passwordHash: true,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new NotFoundError('User not found');
    }

    if (!user.passwordHash) {
      throw new ValidationError(
        'This account does not have a password set. Please complete your account first.'
      );
    }

    const isValidOldPassword = await comparePassword(oldPassword, user.passwordHash);
    if (!isValidOldPassword) {
      throw new ValidationError('Old password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.userRepository.update(user.id, { passwordHash: hashedPassword });

    if (user.email) {
      await this.emailService.sendPasswordChangedEmail({
        name: user.name || 'there',
        email: user.email,
      });
    }
  }

  // CHECK ACCOUNT — returns whether the current user has email and password set
  async checkAccount(userId: UUID): Promise<{ hasEmail: boolean; hasPassword: boolean }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      hasEmail: !!user.email,
      hasPassword: !!user.passwordHash,
    };
  }

  // COMPLETE ACCOUNT — sets name/email/password and upgrades GUEST → CUSTOMER
  async completeAccount(
    userId: UUID,
    {
      name,
      email,
      password,
    }: { name: string; email: string; password: string }
  ): Promise<{ token: string; user: User }> {
    if (!name || !email || !password) {
      throw new ValidationError('Name, email, and password are required');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    // Check email not already taken by another user
    const existingWithEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingWithEmail && existingWithEmail.id !== userId) {
      throw new ConflictError('Email is already in use');
    }

    const hashedPassword = await hashPassword(password);
    await this.userRepository.update(userId, {
      name,
      email,
      passwordHash: hashedPassword,
    });

    // Remove GUEST role and assign CUSTOMER role
    const guestUserRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: { role: true },
    });
    const guestUserRole = guestUserRoles.find(
      (ur) => (ur.role as { name: string }).name === RoleTypes.GUEST
    );
    if (guestUserRole) {
      await this.userRoleRepository.delete({ id: guestUserRole.id });
    }
    await this.userRoleService.assignRolesToUser(userId, [RoleTypes.CUSTOMER]);

    const userService = new UserService();
    const updatedUser = await userService.getUserById(userId);

    const token = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    return { token, user: updatedUser };
  }
}
