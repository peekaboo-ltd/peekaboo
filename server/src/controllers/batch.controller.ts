import { NextFunction, Request, Response } from 'express';
import { BatchService } from '../services/batch.service';
import { AuthRequest } from '../types/auth.types';
import { UnauthorizedError } from '../helpers/errors.helper';
import { UUID } from '../types';
import { RoleTypes } from '../constants/role.constants';

const batchService = new BatchService();

const isAdminOrStaff = (user: AuthRequest['user']): boolean => {
  const roles = user?.userRoles?.map((ur) => ur.role.name) || [];
  return roles.includes(RoleTypes.ADMIN) || roles.includes(RoleTypes.STAFF);
};

export const BatchController = {
  async createBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthRequest;
      const { name, description } = req.body;

      if (!user?.id) {
        throw new UnauthorizedError('User not authenticated');
      }

      const batch = await batchService.createBatch({
        name,
        description,
        createdById: user.id,
      });

      return res.status(201).json({
        message: 'Batch created successfully',
        data: batch,
      });
    } catch (error) {
      next(error);
    }
  },

  async listBatches(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthRequest;

      if (!user?.id) {
        throw new UnauthorizedError('User not authenticated');
      }

      const batches = await batchService.listBatches(
        user.id as UUID,
        isAdminOrStaff(user),
      );

      return res.status(200).json({
        message: 'Batches fetched successfully',
        data: batches,
      });
    } catch (error) {
      next(error);
    }
  },

  async getBatchById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const batch = await batchService.getBatchById(id as UUID);

      return res.status(200).json({
        message: 'Batch fetched successfully',
        data: batch,
      });
    } catch (error) {
      next(error);
    }
  },

  async getBatchOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { user } = req as AuthRequest;

      if (!user?.id) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Admins/Staff can view any batch; others only their own. Use the
      // orders-specific loader for both paths so preview receives sender and
      // recipient relation data consistently.
      const batch = await batchService.getBatchOrders(
        id as UUID,
        user.id as UUID,
        isAdminOrStaff(user),
      );

      return res.status(200).json({
        message: 'Batch orders fetched successfully',
        data: batch,
      });
    } catch (error) {
      next(error);
    }
  },

  async completeBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { user } = req as AuthRequest;

      if (!user?.id) {
        throw new UnauthorizedError('User not authenticated');
      }

      const batch = await batchService.completeBatch(id as UUID, user.id as UUID, isAdminOrStaff(user));

      return res.status(200).json({
        message: 'Batch completed successfully',
        data: batch,
      });
    } catch (error) {
      next(error);
    }
  },
};
