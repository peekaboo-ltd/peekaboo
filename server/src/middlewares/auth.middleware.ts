import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/auth.types";
import { UserService } from "../services/user.service";
import { AuditContext } from "./auditContext.middleware";

const userService = new UserService();

export const authenticate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest;
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_secret"
      ) as any;

      // Get user from database
      const user = await userService.getUserById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      // Attach user to request
      authReq.user = user;
      authReq.user.id = user.id;

      // Set user ID in audit context for audit logging
      AuditContext.setCurrentUserId(user.id);

      next();
    } catch (error) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Authentication error",
    });
  }
};