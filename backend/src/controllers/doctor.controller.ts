import { Request, Response, NextFunction } from 'express';
import * as doctorService from '../services/doctor.service';

export const createDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await doctorService.createDoctor(req.body);
    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await doctorService.getDoctorById(id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorByUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const result = await doctorService.getDoctorByUserId(userId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDoctors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string || '0', 10);
    const size = parseInt(req.query.size as string || '20', 10);
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string || 'firstName';

    const result = await doctorService.getAllDoctors(page, size, search, sortBy);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await doctorService.updateDoctor(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const date = req.query.date as string;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "date" (YYYY-MM-DD) is required',
      });
    }

    const result = await doctorService.getAvailability(id, date);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSpecializations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await doctorService.getAllSpecializations();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await doctorService.getAllDepartments();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
