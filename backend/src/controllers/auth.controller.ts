import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { Role } from '@prisma/client';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const ipAddress = req.ip;

    const result = await authService.loginUser(usernameOrEmail, password, ipAddress);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, firstName, lastName, phone, roles } = req.body;
    const ipAddress = req.ip;

    const result = await authService.registerUser(
      {
        username,
        email,
        passwordHash: password, // Service will hash this password
        firstName,
        lastName,
        phone,
        roles,
      },
      ipAddress
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const ipAddress = req.ip;

    const result = await authService.refreshUserToken(refreshToken, ipAddress);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const ipAddress = req.ip;

    await authService.logoutUser(userId, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;
    const ipAddress = req.ip;

    await authService.changeUserPassword(userId, currentPassword, newPassword, ipAddress);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again.',
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const user = await authService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { roles } = req.body;
    const ipAddress = req.ip;

    const result = await authService.updateRoles(targetUserId, roles as Role[], ipAddress);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { enabled } = req.body;
    const ipAddress = req.ip;

    const result = await authService.toggleStatus(targetUserId, enabled, ipAddress);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
