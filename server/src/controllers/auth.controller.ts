import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../types/auth.types';
import { comparePassword, hashPassword } from '../helpers/auth.helper';
import { RoleTypes } from '../constants/role.constants';
import { UserStatus } from '../constants/user.constants';
import { ValidationError, UnauthorizedError } from '../helpers/errors.helper';
import { AuthService } from '../services/auth.service';

const userService = new UserService();
const authService = new AuthService();

export const AuthController = {
  // LOGIN
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const { user, token } = await authService.login({ username, password });

      return res.status(200).json({
        message: 'Login successful',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  },

  // REGISTER
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phoneNumber, password, roles = [RoleTypes.CUSTOMER] } = req.body;
      const { user, token } = await authService.register({
        name,
        email,
        phoneNumber,
        password,
        roles,
      });

      return res.status(201).json({
        message: 'User registered successfully',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET CURRENT USER
  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Get fresh user data
      const user = await userService.getUserById(req.user.id);

      // Remove password from response
      const { passwordHash, ...userWithoutPassword } = user;

      return res.status(200).json({
        message: 'User fetched successfully',
        data: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  },

  // LOGOUT
  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // In a JWT-based system, logout is typically handled on the client side
      // by removing the token. Here we just return a success response.
      return res.status(200).json({
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  },

  // REFRESH TOKEN
  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Generate new JWT token
      const token = jwt.sign(
        {
          id: req.user.id,
          email: req.user.email,
          phoneNumber: req.user.phoneNumber,
          roles:
            req.user.userRoles?.map(
              (ur: { role: { name: string } }) => ur.role.name
            ) || [],
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        message: 'Token refreshed successfully',
        data: { token },
      });
    } catch (error) {
      next(error);
    }
  },

  // GOOGLE AUTH CALLBACK
  async googleAuthCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as {
        id: string;
        token: string;
        isNewUser: boolean;
        phoneNumber?: string;
      };

      if (!user) {
        return res.redirect(
          `${process.env.FRONTEND_AUTH_FAILURE_URL || 'http://localhost:5173/auth/login'}?error=authentication_failed`
        );
      }

      // Build redirect URL with token
      const frontendSuccessUrl =
        process.env.FRONTEND_AUTH_SUCCESS_URL ||
        'http://localhost:5173/auth/callback';

      // Include isNewUser flag so frontend knows if phone collection is needed
      const redirectUrl = `${frontendSuccessUrl}?token=${user.token}&isNewUser=${user.isNewUser}&needsPhone=${!user.phoneNumber}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  },

  // ADD PHONE NUMBER (for Google auth users)
  async addPhoneNumber(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { phoneNumber } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      if (!phoneNumber) {
        throw new ValidationError('Phone number is required');
      }

      const updatedUser = await authService.addPhoneNumber(userId, phoneNumber);

      return res.status(200).json({
        message: 'Phone number added successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier } = req.body;
      await authService.requestPasswordReset(identifier);

      return res.status(200).json({
        message:
          'If an account exists for that identifier, password reset instructions have been sent.',
      });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);

      return res.status(200).json({
        message: 'Password reset successful. You can now sign in.',
      });
    } catch (error) {
      next(error);
    }
  },
};
