import { Request, Response, NextFunction } from 'express';
import * as prescriptionService from '../services/prescription.service';

export const createPrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await prescriptionService.createPrescription(req.body);
    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await prescriptionService.getPrescriptionById(id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionByAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointmentId = parseInt(req.params.appointmentId, 10);
    const result = await prescriptionService.getPrescriptionByAppointmentId(appointmentId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientPrescriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = parseInt(req.params.patientId, 10);
    const page = parseInt(req.query.page as string || '0', 10);
    const size = parseInt(req.query.size as string || '20', 10);

    const result = await prescriptionService.getPatientPrescriptions(patientId, page, size);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorPrescriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = parseInt(req.params.doctorId, 10);
    const page = parseInt(req.query.page as string || '0', 10);
    const size = parseInt(req.query.size as string || '20', 10);

    const result = await prescriptionService.getDoctorPrescriptions(doctorId, page, size);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPrescriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string || '0', 10);
    const size = parseInt(req.query.size as string || '20', 10);

    const result = await prescriptionService.getAllPrescriptions(page, size);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await prescriptionService.updatePrescription(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

