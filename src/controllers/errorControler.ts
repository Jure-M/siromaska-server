import AppError from '../utils/AppError';
import { Request, Response, NextFunction } from 'express';

const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });
  }
  res.status(500).json({
    status: 'error',
    message: 'Internal server error, please try latter',
  });
};

export default errorHandler;
