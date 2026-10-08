import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../data-source';

// Rejects API traffic while the database is unavailable instead of letting
// every repository call fail with a misleading "No metadata ..." error.
export const requireDatabase = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!AppDataSource.isInitialized) {
    return res.status(503).json({
      message: 'Service temporarily unavailable. Please try again.',
    });
  }
  next();
};
