import { NextFunction, Request, Response } from 'express';
import { RiderLocationService } from '../services/riderLocation.service';
import { UUID } from '../types';
import { AuthRequest } from '../types/auth.types';

const riderLocationService = new RiderLocationService();

export const RiderLocationController = {
  // UPDATE RIDER LOCATION
  async updateRiderLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const riderId = req.user?.id as UUID;
      const { latitude, longitude, isOnline } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({
          message: 'Latitude and longitude are required',
        });
      }

      const riderLocation = await riderLocationService.updateRiderLocation(
        riderId,
        latitude,
        longitude,
        isOnline ?? true
      );

      return res.status(200).json({
        message: 'Rider location updated successfully',
        data: riderLocation,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET RIDER LOCATION
  async getRiderLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { riderId } = req.params;

      const riderLocation = await riderLocationService.getRiderLocation(riderId as UUID);

      if (!riderLocation) {
        return res.status(404).json({
          message: 'Rider location not found',
        });
      }

      return res.status(200).json({
        message: 'Rider location fetched successfully',
        data: riderLocation,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET ALL ONLINE RIDERS
  async getOnlineRiders(req: Request, res: Response, next: NextFunction) {
    try {
      const riderLocations = await riderLocationService.getOnlineRiderLocations();

      return res.status(200).json({
        message: 'Online riders fetched successfully',
        data: riderLocations,
      });
    } catch (error) {
      next(error);
    }
  },

  // SET RIDER OFFLINE
  async setRiderOffline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const riderId = req.user?.id as UUID;

      const riderLocation = await riderLocationService.setRiderOffline(riderId);

      return res.status(200).json({
        message: 'Rider set offline successfully',
        data: riderLocation,
      });
    } catch (error) {
      next(error);
    }
  },
};
