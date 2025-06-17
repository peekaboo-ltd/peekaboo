import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { RoleTypes } from "../constants/role.constants";

const userService = new UserService();

export const UserController = {
  // CREATE USER
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNumber, roles } = req.body;

      // CREATE USER
      const user = await userService.createUser(
        {
          phoneNumber,
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
};
