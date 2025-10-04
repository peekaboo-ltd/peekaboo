import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.type";
import { RoleTypes } from "../constants/role.constants";
import { ForbiddenError } from "../helpers/errors.helper";

export const authorize = (allowedRoles: RoleTypes[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const userRoles = req.user.userRoles?.map(ur => ur.role.name) || [];
      const hasPermission = allowedRoles.some(role => userRoles.includes(role));

      if (!hasPermission) {
        throw new ForbiddenError("You do not have permission to access this resource");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};