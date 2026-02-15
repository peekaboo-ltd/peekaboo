import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { RoleTypes } from "../constants/role.constants";
import { UserStatus } from "../constants/user.constants";
import { In } from "typeorm";
import { UUID } from "../types";
import { AuthRequest } from '../types/auth.types';

const userService = new UserService();

export const UserController = {
  // GET ALL USERS WITH FILTERS
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      // FETCH USERS
      const users = await userService.getUsersWithPagination(req.query);

      // RETURN USERS
      return res.status(200).json({
        message: "Users fetched successfully",
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET USER BY ID
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id as UUID);

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
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        phoneNumber,
        roles,
        name,
        email,
        status = UserStatus.ACTIVE,
        nationality,
        dateOfBirth,
        organizationId,
      } = req.body;
      const { user: requester } = req as AuthRequest;

      // CREATE USER
      const user = await userService.createUser(
        {
          phoneNumber,
          name,
          email,
          status,
          nationality,
          dateOfBirth,
        },
        roles as RoleTypes[],
        {
          organizationId,
          addedById: requester?.id,
        }
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
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await userService.updateUser(id as UUID, updateData);

      return res.status(200).json({
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // UPDATE USER STATUS
  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !Object.values(UserStatus).includes(status)) {
        return res.status(400).json({
          message: "Invalid status provided",
        });
      }

      const user = await userService.updateUserStatus(id as UUID, status);

      return res.status(200).json({
        message: "User status updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE USER (SOFT DELETE)
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await userService.deleteUser(id as UUID);

      return res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // RESET USER PASSWORD
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await userService.resetPassword(id as UUID);

      return res.status(200).json({
        message: "Password reset email sent successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
