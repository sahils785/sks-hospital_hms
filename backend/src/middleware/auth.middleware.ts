import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { Role } from '@prisma/client';
import { DecodedUser } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBob3NwaXRhbCBtYW5hZ2VtZW50IHN5c3RlbSBqd3QgdG9rZW4gZ2VuZXJhdGlvbg==';

/**
 * Authentication Middleware
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid authorization header'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired authentication token'));
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 */
export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }

    const hasAccess = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }

    next();
  };
};
