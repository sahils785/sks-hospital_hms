import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  loginValidator,
  registerValidator,
  changePasswordValidator,
} from '../validators/auth.validator';
import { Role } from '@prisma/client';

const router = Router();

// Public routes
router.post('/login', loginValidator, authController.login);
router.post('/register', registerValidator, authController.register);
router.post('/refresh', authController.refresh);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, changePasswordValidator, authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);

// Admin-only routes
router.put('/users/:id/roles', authenticate, authorize([Role.ADMIN]), authController.updateUserRoles);
router.put('/users/:id/status', authenticate, authorize([Role.ADMIN]), authController.toggleUserStatus);

export default router;
