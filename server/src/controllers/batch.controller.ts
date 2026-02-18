import { NextFunction, Request, Response } from 'express';
import { BatchService } from '../services/batch.service';
import { AuthRequest } from '../types/auth.types';
import { UnauthorizedError } from '../helpers/errors.helper';
import { UUID } from '../types';

const batchService = new BatchService();

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
};
