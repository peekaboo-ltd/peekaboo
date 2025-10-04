import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { RoleTypes } from "../constants/role.constants";
import { UserStatus } from "../constants/user.constants";
import { AuthRequest } from "../types/auth.type";
import { In } from "typeorm";

const userService = new UserService();

export const UserController = {
  // GET ALL USERS WITH FILTERS
  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        roles,
        status,
        phoneNumber,
        name,
        email,
      } = req.query;

      // Build filters
      const filters: any = {};
      
      if (search) {
        filters.search = search as string;
      }
      
      if (roles) {
        const roleArray = Array.isArray(roles) ? roles : [roles];
        filters.roles = roleArray as RoleTypes[];
      }
      
      if (status) {
        filters.status = status as UserStatus;
      }
      
      if (phoneNumber) {
        filters.phoneNumber = phoneNumber as string;
      }
      
      if (name) {
        filters.name = name as string;
      }
      
      if (email) {
        filters.email = email as string;
      }

      const users = await userService.getUsersWithPagination({
        page: Number(page),
        limit: Number(limit),
        filters,
      });

      return res.status(200).json({
        message: "Users fetched successfully",
        ...users,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET USER BY ID
  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const user = await userService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.status(200).json({
        message: "User fetched successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // CREATE USER
  async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { 
        phoneNumber, 
        roles, 
        name, 
        email, 
        password,
        status = UserStatus.ACTIVE,
        nationality,
        dateOfBirth
      } = req.body;

      // CREATE USER
      const user = await userService.createUser(
        {
          phoneNumber,
          name,
          email,
          password,
          status,
          nationality,
          dateOfBirth,
        },
        roles as RoleTypes[]
      );

      // RETURN USER
      return res.status(201).json({
        message: "User created successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // UPDATE USER
  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await userService.updateUser(id, updateData);

      return res.status(200).json({
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // UPDATE USER STATUS
  async updateUserStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !Object.values(UserStatus).includes(status)) {
        return res.status(400).json({
          message: "Invalid status provided",
        });
      }

      const user = await userService.updateUserStatus(id, status);

      return res.status(200).json({
        message: "User status updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE USER (SOFT DELETE)
  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await userService.deleteUser(id);

      return res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // RESET USER PASSWORD
  async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await userService.resetPassword(id);

      return res.status(200).json({
        message: "Password reset email sent successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // GET USER ORDERS
  async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const orders = await userService.getUserOrders(id, {
        page: Number(page),
        limit: Number(limit),
      });

      return res.status(200).json({
        message: "User orders fetched successfully",
        ...orders,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET USER ASSIGNMENTS (FOR RIDERS)
  async getUserAssignments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const assignments = await userService.getUserAssignments(id, {
        page: Number(page),
        limit: Number(limit),
      });

      return res.status(200).json({
        message: "User assignments fetched successfully",
        ...assignments,
      });
    } catch (error) {
      next(error);
    }
  },
};
