import { Request, Response, NextFunction } from 'express';
import * as appointmentService from '../services/appointment.service';

export const bookAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await appointmentService.bookAppointment(req.body);
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await appointmentService.getAppointmentById(id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string || '0', 10);
    const size = parseInt(req.query.size as string || '20', 10);
    const status = req.query.status as string;

    const result = await appointmentService.getAllAppointments(page, size, status);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = parseInt(req.params.patientId, 10);
    const page = parseInt(req.query.page as string || '0', 10);
    const size = parseInt(req.query.size as string || '20', 10);

    const result = await appointmentService.getPatientAppointments(patientId, page, size);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = parseInt(req.params.doctorId, 10);
    const page = parseInt(req.query.page as string || '0', 10);
    const size = parseInt(req.query.size as string || '20', 10);

    const result = await appointmentService.getDoctorAppointments(doctorId, page, size);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTodayAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = parseInt(req.params.doctorId, 10);
    const result = await appointmentService.getTodayAppointments(doctorId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const rescheduleAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { newDateTime } = req.body;

    if (!newDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Request body must include "newDateTime"',
      });
    }

    const result = await appointmentService.rescheduleAppointment(id, newDateTime);

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { reason } = req.body || {};

    const result = await appointmentService.cancelAppointment(id, reason);

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const completeAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { consultationNotes } = req.body || {};

    const result = await appointmentService.completeAppointment(id, consultationNotes);

    res.status(200).json({
      success: true,
      message: 'Appointment completed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await appointmentService.confirmAppointment(id);

    res.status(200).json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
