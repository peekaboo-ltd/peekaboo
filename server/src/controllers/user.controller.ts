import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { User } from "../entities/user.entity";
import { UserService } from "../services/user.service";
import { RoleTypes } from "../constants/role.constants";
import { UserStatus } from "../constants/user.constants";
import { UUID } from "../types";
import { AuthRequest } from '../types/auth.types';
import { AuditLogService } from '../services/auditLog.service';
import {
  uploadUserAvatarToCloudinary,
  uploadUserStatusProofToCloudinary,
} from '../integrations/cloudinary/cloudinary.service';

const userService = new UserService();
const auditLogService = new AuditLogService();
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

  // GET USERS TRACKING LIST
  async getUsersTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const trackingUsers = await userService.getUsersTracking(req.query);

      return res.status(200).json({
        message: 'Users tracking fetched successfully',
        data: trackingUsers,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET RIDER MANAGEMENT PERFORMANCE
  async getRiderManagementPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const riderPerformance = await userService.getRiderManagementPerformance(req.query);

      return res.status(200).json({
        message: 'Rider management performance fetched successfully',
        data: riderPerformance,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET ONE RIDER MANAGEMENT PERFORMANCE RECORD
  async getRiderManagementPerformanceByRiderId(req: Request, res: Response, next: NextFunction) {
    try {
      const { riderId } = req.params;

      if (!UUID_REGEX.test(riderId)) {
        return res.status(400).json({
          message: 'Invalid rider id provided',
        });
      }

      const riderPerformance = await userService.getRiderManagementPerformanceByRiderId(
        riderId as UUID,
        req.query,
      );

      return res.status(200).json({
        message: 'Rider management performance fetched successfully',
        data: riderPerformance,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET RIDER MANAGEMENT ATTENDANCE
  async getRiderManagementAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const riderAttendance = await userService.getRiderManagementAttendance(req.query);

      return res.status(200).json({
        message: 'Rider attendance fetched successfully',
        data: riderAttendance,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET ONE RIDER MANAGEMENT ATTENDANCE RECORD
  async getRiderManagementAttendanceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!UUID_REGEX.test(id)) {
        return res.status(400).json({
          message: 'Invalid attendance id provided',
        });
      }

      const attendance = await userService.getRiderManagementAttendanceById(id as UUID);

      return res.status(200).json({
        message: 'Rider attendance fetched successfully',
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET RIDER MANAGEMENT PROBLEM REPORTS
  async getRiderManagementProblemReports(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '0', size = '10', attendanceDate, riderId, name } = req.query;
      const pageNumber = Number(page);
      const sizeNumber = Number(size);

      if (!Number.isInteger(pageNumber) || pageNumber < 0) {
        return res.status(400).json({
          message: 'Invalid page parameter provided',
        });
      }

      if (!Number.isInteger(sizeNumber) || sizeNumber <= 0) {
        return res.status(400).json({
          message: 'Invalid size parameter provided',
        });
      }

      const normalizedQuery = {
        page: String(pageNumber),
        size: String(sizeNumber),
        attendanceDate: typeof attendanceDate === 'string' ? attendanceDate : undefined,
        riderId: typeof riderId === 'string' ? riderId : undefined,
        name: typeof name === 'string' ? name : undefined,
      };

      const problemReports = await userService.getRiderManagementProblemReports(normalizedQuery);

      return res.status(200).json({
        message: 'Rider problem reports fetched successfully',
        data: problemReports,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET ONE RIDER PROBLEM REPORT
  async getRiderManagementProblemReportById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!UUID_REGEX.test(id)) {
        return res.status(400).json({
          message: 'Invalid problem report id provided',
        });
      }

      const problemReport = await userService.getRiderManagementProblemReportById(id as UUID);

      return res.status(200).json({
        message: 'Rider problem report fetched successfully',
        data: problemReport,
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

      return res.status(200).json({
        message: "User fetched successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET USER CURRENT-LOCATION HISTORY
  async getCurrentLocationHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { page = '0', size = '10', startTime, endTime } = req.query;

      if (!UUID_REGEX.test(id)) {
        return res.status(400).json({
          message: 'Invalid user id provided',
        });
      }

      const pageNumber = Number(page);
      const sizeNumber = Number(size);

      if (
        !Number.isInteger(pageNumber) ||
        pageNumber < 0 ||
        !Number.isInteger(sizeNumber) ||
        sizeNumber <= 0
      ) {
        return res.status(400).json({
          message: 'Invalid pagination params provided',
        });
      }

      const startTimeValue = typeof startTime === 'string' ? new Date(startTime) : undefined;
      const endTimeValue = typeof endTime === 'string' ? new Date(endTime) : undefined;

      if (startTime && (!startTimeValue || Number.isNaN(startTimeValue.getTime()))) {
        return res.status(400).json({
          message: 'Invalid startTime provided',
        });
      }

      if (endTime && (!endTimeValue || Number.isNaN(endTimeValue.getTime()))) {
        return res.status(400).json({
          message: 'Invalid endTime provided',
        });
      }

      if (startTimeValue && endTimeValue && startTimeValue.getTime() > endTimeValue.getTime()) {
        return res.status(400).json({
          message: 'startTime must be before endTime',
        });
      }

      const timeline = await auditLogService.fetchUserCurrentLocationHistory({
        userId: id as UUID,
        page: pageNumber,
        size: sizeNumber,
        startTime: startTimeValue,
        endTime: endTimeValue,
      });

      return res.status(200).json({
        message: 'Current location history fetched successfully',
        data: timeline,
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
      const {
        name,
        email,
        phoneNumber,
        nationality,
        dateOfBirth,
        profilePhotoUrl,
        defaultLocation,
        status,
      } = req.body;
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      if (nationality !== undefined) updateData.nationality = nationality;
      if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
      if (profilePhotoUrl !== undefined) updateData.profilePhotoUrl = profilePhotoUrl;
      if (defaultLocation !== undefined) updateData.defaultLocation = defaultLocation;
      if (status !== undefined) {
        if (![UserStatus.ACTIVE, UserStatus.INACTIVE].includes(status as UserStatus)) {
          return res.status(400).json({
            message: 'Invalid status provided',
          });
        }
        updateData.status = status;
      }

      const user = await userService.updateUser(id as UUID, updateData);

      return res.status(200).json({
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },


  // UPDATE CURRENT USER LOCATION
  async updateCurrentLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthRequest;
      const { latitude, longitude } = req.body;

      if (!user?.id) {
        return res.status(401).json({
          message: 'User not authenticated',
        });
      }

      if (
        typeof latitude !== 'number' ||
        typeof longitude !== 'number' ||
        Number.isNaN(latitude) ||
        Number.isNaN(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          message: 'Invalid location coordinates provided',
        });
      }

      const updatedUser = await userService.updateCurrentLocation(user.id as UUID, {
        latitude,
        longitude,
      });

      return res.status(200).json({
        message: 'Current location updated successfully',
        data: updatedUser.currentLocation,
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

  // UPDATE CURRENT USER STATUS WITH PROOF IMAGE
  async updateMyStatusWithProof(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthRequest;
      const file = req.file;
      const { status, latitude, longitude, locationLabel, capturedAt } = req.body as {
        status?: UserStatus;
        latitude?: string | number;
        longitude?: string | number;
        locationLabel?: string;
        capturedAt?: string;
        overlayTimestamp?: string;
        overlayLocationLabel?: string;
        overlayAppliedOnClient?: string;
      };

      if (!user?.id) {
        return res.status(401).json({
          message: 'User not authenticated',
        });
      }

      if (!status || !Object.values(UserStatus).includes(status)) {
        return res.status(400).json({
          message: 'Invalid status provided',
        });
      }

      if (!file) {
        return res.status(400).json({
          message: 'No proof image provided',
        });
      }

      const parsedLatitude =
        typeof latitude === 'string' ? Number(latitude) : latitude;
      const parsedLongitude =
        typeof longitude === 'string' ? Number(longitude) : longitude;

      if (
        typeof parsedLatitude !== 'number' ||
        typeof parsedLongitude !== 'number' ||
        Number.isNaN(parsedLatitude) ||
        Number.isNaN(parsedLongitude) ||
        parsedLatitude < -90 ||
        parsedLatitude > 90 ||
        parsedLongitude < -180 ||
        parsedLongitude > 180
      ) {
        return res.status(400).json({
          message: 'Invalid location coordinates provided',
        });
      }

      const localFilePath = (file as Express.Multer.File & { path?: string }).path;
      if (!localFilePath) {
        return res.status(500).json({
          message: 'Failed to process uploaded proof image',
        });
      }

      let proofImageUrl = '';
      const overlayAppliedOnClient =
        String(req.body?.overlayAppliedOnClient || '').toLowerCase() === 'true';
      const overlayTimestamp = String(req.body?.overlayTimestamp || '').trim();
      const overlayLocationLabel = String(
        req.body?.overlayLocationLabel || locationLabel || 'Location unavailable'
      ).trim();
      try {
        proofImageUrl = await uploadUserStatusProofToCloudinary(localFilePath, {
          userId: user.id,
          status,
          overlayTimestamp,
          overlayLocationLabel,
          overlayAppliedOnClient,
        });
      } catch (error) {
        try {
          if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
          }
        } catch {
          // ignore local file delete errors
        }

        const uploadErrorMessage =
          error instanceof Error && error.message
            ? error.message
            : 'Failed to upload status proof image';

        return res.status(502).json({
          message: uploadErrorMessage,
        });
      }

      const currentTimestamp = capturedAt || new Date().toISOString();

      const updatedUser = await userService.updateUser(user.id as UUID, {
        status,
        currentLocation: {
          latitude: parsedLatitude,
          longitude: parsedLongitude,
          collectedAt: currentTimestamp,
        },
      });
      await userService.createStatusProof({
        userId: user.id as UUID,
        imageUrl: proofImageUrl,
        status,
        capturedAt: currentTimestamp,
        locationLabel: locationLabel || undefined,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        overlayApplied: true,
        overlayVersion: 'v1',
        overlaySource: overlayAppliedOnClient ? 'client_and_server' : 'server',
      });

      try {
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }
      } catch {
        // ignore local file delete errors
      }

      return res.status(200).json({
        message: 'User status with proof updated successfully',
        data: updatedUser,
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

  // UPLOAD USER AVATAR
  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          message: "No image file provided",
        });
      }
      
      const localFilePath = (file as Express.Multer.File & { path?: string }).path;
      if (!localFilePath) {
        return res.status(500).json({
          message: "Failed to process uploaded image",
        });
      }

      const cloudinaryUrl = await uploadUserAvatarToCloudinary(localFilePath, {
        userId: id,
      });

      try {
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }
      } catch {
        // ignore local file delete errors
      }

      const user = await userService.updateUser(id as UUID, {
        profilePhotoUrl: cloudinaryUrl,
      });

      return res.status(200).json({
        message: "Profile photo updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // REMOVE USER AVATAR
  async removeAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id as UUID);

      if (user.profilePhotoUrl) {
        const fullPath = path.join(process.cwd(), "uploads", user.profilePhotoUrl);
        try {
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch {
          // ignore file delete errors
        }
      }

      const updatedUser = await userService.updateUser(id as UUID, {
        profilePhotoUrl: null as User['profilePhotoUrl'],
      });

      return res.status(200).json({
        message: "Profile photo removed successfully",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },
};
