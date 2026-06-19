import { Router } from 'express';
import * as patientController from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT]),
  patientController.createPatient
);

router.get(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST]),
  patientController.getAllPatients
);

router.get(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.PATIENT]),
  patientController.getPatient
);

router.get(
  '/user/:userId',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.PATIENT]),
  patientController.getPatientByUserId
);

router.put(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT]),
  patientController.updatePatient
);

router.post(
  '/:id/medical-history',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR]),
  patientController.addMedicalHistory
);

router.post(
  '/:id/emergency-contacts',
  authenticate,
  authorize([Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT]),
  patientController.addEmergencyContact
);

export default router;
