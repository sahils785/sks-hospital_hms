import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get(
  '/dashboard',
  authenticate,
  authorize([Role.ADMIN, Role.DOCTOR, Role.BILLING_STAFF]),
  analyticsController.getStats
);

export default router;
