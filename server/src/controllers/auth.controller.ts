import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserService } from "../services/user.service";
import { AuthRequest } from "../types/auth.types";
import { comparePassword, hashPassword } from "../helpers/auth.helper";
import { RoleTypes } from "../constants/role.constants";
import { UserStatus } from "../constants/user.constants";
import { ValidationError, UnauthorizedError } from "../helpers/errors.helper";

const userService = new UserService();

export const AuthController = {
  // LOGIN
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, phoneNumber } = req.body;

      if (!password || (!email && !phoneNumber)) {
        throw new ValidationError("Email/Phone number and password are required");
      }

      // Find user by email or phone number
      const user = await userService.getUserByCondition(
        email ? { email } : { phoneNumber },
        true // Include password for authentication
      );

      if (!user) {
        throw new UnauthorizedError("Invalid credentials");
      }

      // Check if user is active
      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedError("Account is not active");
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.passwordHash!);
      if (!isValidPassword) {
        throw new UnauthorizedError("Invalid credentials");
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          phoneNumber: user.phoneNumber,
          roles: user.userRoles?.map(ur => ur.role.name) || []
        },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "24h" }
      );

      // Remove password from response and ensure userRoles are included
      const { passwordHash: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        message: "Login successful",
        data: {
          user: {
            ...userWithoutPassword,
            roles: user.userRoles?.map(ur => ur.role.name) || []
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // REGISTER
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        name, 
        email, 
        phoneNumber, 
        password, 
        role = RoleTypes.CUSTOMER 
      } = req.body;

      if (!phoneNumber || !password) {
        throw new ValidationError("Phone number and password are required");
      }

      // Check if user already exists
      const existingUser = await userService.getUserByCondition([
        { email },
        { phoneNumber }
      ]);

      if (existingUser) {
        throw new ValidationError("User with this email or phone number already exists");
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await userService.createUser(
        {
          name,
          email,
          phoneNumber,
          passwordHash: hashedPassword,
          status: UserStatus.ACTIVE
        },
        [role]
      );

      // Fetch user with roles
      const userWithRoles = await userService.getUserByCondition({ id: user.id });

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          roles: userWithRoles?.userRoles?.map(ur => ur.role.name) || [role]
        },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "24h" }
      );

      // Remove password from response
      const { passwordHash: _, ...userWithoutPassword } = userWithRoles || user;

      return res.status(201).json({
        message: "Registration successful",
        data: {
          user: {
            ...userWithoutPassword,
            roles: userWithRoles?.userRoles?.map(ur => ur.role.name) || [role]
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // GET CURRENT USER
  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError("User not authenticated");
      }

      // Get fresh user data
      const user = await userService.getUserById(req.user.id);

      // Remove password from response
      const { passwordHash, ...userWithoutPassword } = user;

      return res.status(200).json({
        message: "User fetched successfully",
        data: userWithoutPassword
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
        message: "Logout successful"
      });
    } catch (error) {
      next(error);
    }
  },

  // REFRESH TOKEN
  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError("User not authenticated");
      }

      // Generate new JWT token
      const token = jwt.sign(
        { 
          id: req.user.id, 
          email: req.user.email,
          phoneNumber: req.user.phoneNumber,
          roles: req.user.userRoles?.map((ur: { role: { name: string } }) => ur.role.name) || []
        },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "24h" }
      );

      return res.status(200).json({
        message: "Token refreshed successfully",
        data: { token }
      });
    } catch (error) {
      next(error);
    }
  }
};