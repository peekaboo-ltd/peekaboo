import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/auth.types";
import { UserService } from "../services/user.service";

const userService = new UserService();

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Try to get token from HTTP-only cookie first, then fallback to Authorization header
    let token = req.cookies['auth-token'];
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

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
      req.user = user;
      req.user.id = user.id;

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