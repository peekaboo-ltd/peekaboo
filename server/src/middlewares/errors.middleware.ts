import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError, CustomError } from "../helpers/errors.helper";
import logger from "../helpers/logger.helper";
import { LogsService } from "../services/logs.service";
import { LogReferenceTypes, LogTypes } from "../constants/logs.constants";
import { UUID } from "../types";

// INITIALIZE LOGS SERVICE
const logsService = new LogsService();

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    const isFileSize = err.code === 'LIMIT_FILE_SIZE';
    return res.status(isFileSize ? 413 : 400).json({
      message: isFileSize
        ? 'Proof image is too large. Please use an image under 8MB.'
        : err.message,
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: err.message || 'Invalid file upload',
    });
  }

  if (
    typeof err.message === 'string' &&
    err.message.toLowerCase().includes('only jpeg, png and webp images are allowed')
  ) {
    return res.status(400).json({
      message: 'Invalid file type. Please upload JPEG, PNG, or WebP image.',
    });
  }

  if (err instanceof AppError) {
    logger.debug(err.message);
    logsService.createLog({
      type: err?.errorCode,
      message: err.message,
      userId: err?.data?.userId ? (err?.data?.userId as UUID) : undefined,
      referenceId: err?.data?.referenceId,
      referenceType: err?.data?.referenceType,
    });

    // Check if data contains validation errors array
    const hasErrors = err?.data && 'errors' in err.data && Array.isArray((err.data as any).errors);
    
    return res.status(err.statusCode).json({
      message: err.message,
      ...(hasErrors ? { errors: (err.data as any).errors } : {}),
      ...(err?.data && !hasErrors ? { data: err.data } : {}),
    });
  }

  // FOR UNHANDLED ERRORS
  logger.error({
    message: err.message,
    stack: err.stack,
    name: err.name,
    ...(err.data && { data: err.data })
  });
  logsService.createLog({
    type: LogTypes.INTERNAL_SERVER_ERROR,
    message: err.message,
    userId: err?.data?.userId ? (err?.data?.userId as UUID) : undefined,
    referenceId: err?.data?.referenceId,
    referenceType:
      err?.data?.referenceType || LogReferenceTypes.INTERNAL_SERVER_ERROR,
  });
  return res.status(500).json({
    message: err.message,
  });
};

export default errorHandler;
