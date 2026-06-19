import { Router } from 'express';
import * as doctorController from '../controllers/doctor.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public / Authenticated user lookups
router.get('/', authenticate, doctorController.getAllDoctors);
router.get('/specializations', authenticate, doctorController.getSpecializations);
router.get('/departments', authenticate, doctorController.getDepartments);
router.get('/:id', authenticate, doctorController.getDoctor);
router.get('/user/:userId', authenticate, doctorController.getDoctorByUserId);
router.get('/:id/availability', authenticate, doctorController.getAvailability);

// Admin-only creation
router.post(
  '/',
  authenticate,
  authorize([Role.ADMIN]),
  doctorController.createDoctor
);

// Admin or Doctor profile modification
router.put(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR]),
  doctorController.updateDoctor
);

export default router;
