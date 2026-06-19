import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service';

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await analyticsService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
