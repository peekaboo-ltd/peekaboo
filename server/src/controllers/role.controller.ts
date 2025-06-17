import { NextFunction, Request, Response } from "express";
import { RoleService } from "../services/role.service";

const roleService = new RoleService();

export const RoleController = {
  // CREATE ROLE
  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      
      // CREATE ROLE
      const role = await roleService.createRole({
        name,
      });

      // RETURN ROLE
      return res.status(201).json({
        message: "Role created successfully",
        data: role,
      });
    } catch (error) {
      next(error);
    }
  },
};
