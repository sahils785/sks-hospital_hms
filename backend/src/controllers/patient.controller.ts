import { Request, Response, NextFunction } from 'express';
import * as patientService from '../services/patient.service';

export const createPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await patientService.createPatient(req.body);
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await patientService.getPatientById(id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientByUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const result = await patientService.getPatientByUserId(userId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string || '0', 10);
    const size = parseInt(req.query.size as string || '20', 10);
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string || 'createdAt';

    const result = await patientService.getAllPatients(page, size, search, sortBy);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await patientService.updatePatient(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const addMedicalHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await patientService.addMedicalHistory(id, req.body);
    res.status(201).json({
      success: true,
      message: 'Medical history added successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const addEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await patientService.addEmergencyContact(id, req.body);
    res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
