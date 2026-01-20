import { Request, Response, NextFunction, RequestHandler } from "express";
import { AuthRequest } from "../types/auth.types";
import { RoleTypes } from "../constants/role.constants";
import { ForbiddenError } from "../helpers/errors.helper";

export const authorize = (allowedRoles: RoleTypes[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    try {
      if (!authReq.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const userRoles = authReq.user.userRoles?.map((ur) => ur.role.name) || [];
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