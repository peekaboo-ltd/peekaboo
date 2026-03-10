import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { uploadAvatar } from "../middlewares/upload.middleware";
import { RoleTypes } from "../constants/role.constants";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET all users with filters (ADMIN only)
router.get("/", authorize([RoleTypes.ADMIN, RoleTypes.BUSINESS]), UserController.getUsers);

// GET lightweight users tracking list
router.get(
  "/tracking",
  authorize([RoleTypes.ADMIN, RoleTypes.BUSINESS, RoleTypes.STAFF]),
  UserController.getUsersTracking
);

// GET user by ID (ADMIN or own profile)
router.get("/:id", UserController.getUserById);

// GET user current-location history timeline
router.get('/:id/current-location-history', UserController.getCurrentLocationHistory);

// CREATE new user (ADMIN only)
router.post("/", authorize([RoleTypes.ADMIN, RoleTypes.BUSINESS]), UserController.createUser);

// UPDATE current user location
router.patch('/me/current-location', UserController.updateCurrentLocation);

// UPDATE user (ADMIN or own profile)
router.patch("/:id", UserController.updateUser);

// Upload profile photo (own profile)
router.post("/:id/avatar", uploadAvatar, UserController.uploadAvatar);

// Remove profile photo (own profile)
router.delete("/:id/avatar", UserController.removeAvatar);

// UPDATE user status (ADMIN only)
router.patch("/:id/status", authorize([RoleTypes.ADMIN]), UserController.updateUserStatus);

// DELETE user (ADMIN only)
router.delete("/:id", authorize([RoleTypes.ADMIN]), UserController.deleteUser);

// RESET user password (ADMIN only)
router.post("/:id/reset-password", authorize([RoleTypes.ADMIN]), UserController.resetPassword);

export default router;
