import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// PUBLIC ROUTES
router.post("/login", AuthController.login);
router.post("/register", AuthController.register);

// PROTECTED ROUTES
router.use(authenticate);
router.get("/me", AuthController.getCurrentUser);
router.post("/logout", AuthController.logout);
router.post("/refresh", AuthController.refreshToken);

export default router;