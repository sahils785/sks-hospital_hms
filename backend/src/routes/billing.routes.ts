import { Router } from 'express';
import * as billingController from '../controllers/billing.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post(
  '/invoices',
  authenticate,
  authorize([Role.ADMIN, Role.BILLING_STAFF, Role.RECEPTIONIST]),
  billingController.createInvoice
);

router.post(
  '/payments',
  authenticate,
  authorize([Role.ADMIN, Role.BILLING_STAFF, Role.PATIENT]),
  billingController.processPayment
);

router.get(
  '/invoices',
  authenticate,
  authorize([Role.ADMIN, Role.BILLING_STAFF]),
  billingController.getAllInvoices
);

router.get(
  '/invoices/:id',
  authenticate,
  authorize([Role.ADMIN, Role.BILLING_STAFF, Role.PATIENT]),
  billingController.getInvoice
);

router.get(
  '/patient/:patientId/invoices',
  authenticate,
  authorize([Role.ADMIN, Role.BILLING_STAFF, Role.PATIENT]),
  billingController.getPatientInvoices
);

export default router;
