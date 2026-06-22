import { Router } from 'express';
import * as prescriptionController from '../controllers/prescription.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR]),
  prescriptionController.createPrescription
);

router.get(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR, Role.PHARMACIST, Role.PATIENT]),
  prescriptionController.getAllPrescriptions
);

router.get(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR, Role.PHARMACIST, Role.PATIENT]),
  prescriptionController.getPrescription
);

router.get(
  '/appointment/:appointmentId',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR, Role.PHARMACIST, Role.PATIENT]),
  prescriptionController.getPrescriptionByAppointment
);

router.get(
  '/patient/:patientId',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR, Role.PHARMACIST, Role.PATIENT]),
  prescriptionController.getPatientPrescriptions
);

router.get(
  '/doctor/:doctorId',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR]),
  prescriptionController.getDoctorPrescriptions
);

router.put(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR]),
  prescriptionController.updatePrescription
);

export default router;
