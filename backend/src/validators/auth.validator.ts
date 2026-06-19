import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors
      .array()
      .map((err) => `${err.type === 'field' ? err.path : ''}: ${err.msg}`)
      .join(', ');
    return next(new BadRequestError(errorMsg));
  }
  next();
};

export const loginValidator = [
  body('usernameOrEmail')
    .notEmpty()
    .withMessage('Username or Email is required')
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest,
];

export const registerValidator = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim(),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim(),
  body('phone')
    .optional()
    .isString()
    .withMessage('Phone must be a string')
    .trim(),
  validateRequest,
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  validateRequest,
];
