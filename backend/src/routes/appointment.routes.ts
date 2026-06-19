import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT, Role.DOCTOR]),
  appointmentController.bookAppointment
);

router.get(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.RECEPTIONIST]),
  appointmentController.getAllAppointments
);

router.get(
  '/:id',
  authenticate,
  appointmentController.getAppointment
);

router.get(
  '/patient/:patientId',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.PATIENT]),
  appointmentController.getPatientAppointments
);

router.get(
  '/doctor/:doctorId',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST]),
  appointmentController.getDoctorAppointments
);

router.get(
  '/doctor/:doctorId/today',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR]),
  appointmentController.getTodayAppointments
);

router.put(
  '/:id/reschedule',
  authenticate,
  authorize([Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT]),
  appointmentController.rescheduleAppointment
);

router.put(
  '/:id/cancel',
  authenticate,
  authorize([Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT, Role.DOCTOR]),
  appointmentController.cancelAppointment
);

router.put(
  '/:id/complete',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR]),
  appointmentController.completeAppointment
);

router.put(
  '/:id/confirm',
  authenticate,
  authorize([Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR]),
  appointmentController.confirmAppointment
);

export default router;
