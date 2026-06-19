import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { logAudit } from '../utils/audit';
import { Role, User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBob3NwaXRhbCBtYW5hZ2VtZW50IHN5c3RlbSBqd3QgdG9rZW4gZ2VuZXJhdGlvbg==';
const ACCESS_EXPIRATION = parseInt(process.env.JWT_ACCESS_EXPIRATION || '900000', 10); // 15 mins
const REFRESH_EXPIRATION = parseInt(process.env.JWT_REFRESH_EXPIRATION || '604800000', 10); // 7 days

export interface AuthUserDto {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  enabled: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const toUserDto = (user: User): AuthUserDto => ({
  id: user.id,
  username: user.username,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  enabled: user.enabled,
  roles: user.roles.map(r => `ROLE_${r}`),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * Generate Access Token
 */
export const generateAccessToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    },
    JWT_SECRET,
    { expiresIn: `${ACCESS_EXPIRATION}ms` }
  );
};

/**
 * Generate and save Refresh Token
 */
export const createRefreshToken = async (userId: number): Promise<string> => {
  const token = jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: `${REFRESH_EXPIRATION}ms`,
  });

  const expiryDate = new Date(Date.now() + REFRESH_EXPIRATION);

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiryDate,
    },
  });

  return token;
};

/**
 * Login Service
 */
export const loginUser = async (
  usernameOrEmail: string,
  password: string,
  ipAddress?: string
) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Account lock check
  if (user.accountLocked) {
    const isLockExpired =
      user.lockTime && new Date().getTime() - new Date(user.lockTime).getTime() > 30 * 60 * 1000;

    if (isLockExpired) {
      // Reset lock details
      await prisma.user.update({
        where: { id: user.id },
        data: {
          accountLocked: false,
          failedLoginAttempts: 0,
          lockTime: null,
        },
      });
    } else {
      throw new UnauthorizedError(
        'Account is locked due to multiple failed login attempts. Try again after 30 minutes.'
      );
    }
  }

  // Validate password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const nextAttempts = user.failedLoginAttempts + 1;
    const shouldLock = nextAttempts >= 5;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: nextAttempts,
        accountLocked: shouldLock,
        lockTime: shouldLock ? new Date() : null,
      },
    });

    logAudit(user.id, 'LOGIN_FAILED', 'Failed login attempt', ipAddress);
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check user is enabled
  if (!user.enabled) {
    throw new UnauthorizedError('Account is disabled. Contact system administrator.');
  }

  // Successful Login: Reset counters
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      accountLocked: false,
      lockTime: null,
    },
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = await createRefreshToken(user.id);

  logAudit(user.id, 'LOGIN_SUCCESS', 'Logged in successfully', ipAddress);

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    user: toUserDto(user),
  };
};

/**
 * Register Service
 */
export const registerUser = async (
  data: {
    username: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roles?: Role[];
  },
  ipAddress?: string
) => {
  const existingUsername = await prisma.user.findUnique({
    where: { username: data.username },
  });
  if (existingUsername) {
    throw new BadRequestError('Username is already taken');
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingEmail) {
    throw new BadRequestError('Email is already registered');
  }

  const hashedPassword = await bcrypt.hash(data.passwordHash, 10);
  const userRoles = data.roles && data.roles.length > 0 ? data.roles : [Role.PATIENT];

  const newUser = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      passwordHash: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      roles: userRoles,
      enabled: true,
    },
  });

  // If PATIENT role is assigned, create Patient profile
  if (userRoles.includes(Role.PATIENT)) {
    await prisma.patient.create({
      data: {
        userId: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  }

  // If DOCTOR role is assigned, create Doctor profile
  if (userRoles.includes(Role.DOCTOR)) {
    await prisma.doctor.create({
      data: {
        userId: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        specialization: 'General',
        licenseNumber: `LIC-${newUser.id}-${Date.now().toString().slice(-4)}`,
        available: true,
      },
    });
  }

  logAudit(newUser.id, 'REGISTER_SUCCESS', `New user registered with roles: ${userRoles.join(', ')}`, ipAddress);

  return toUserDto(newUser);
};

/**
 * Token Refresh Service
 */
export const refreshUserToken = async (token: string, ipAddress?: string) => {
  const savedToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!savedToken) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  if (new Date() > savedToken.expiryDate) {
    await prisma.refreshToken.delete({ where: { token } });
    throw new UnauthorizedError('Expired refresh token');
  }

  // Create new tokens (Token rotation)
  await prisma.refreshToken.delete({ where: { token } });

  const newAccessToken = generateAccessToken(savedToken.user);
  const newRefreshToken = await createRefreshToken(savedToken.user.id);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    tokenType: 'Bearer',
  };
};

/**
 * Logout Service
 */
export const logoutUser = async (userId: number, ipAddress?: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  logAudit(userId, 'LOGOUT_SUCCESS', 'Logged out successfully', ipAddress);
};

/**
 * Change Password Service
 */
export const changeUserPassword = async (
  userId: number,
  currentPass: string,
  newPass: string,
  ipAddress?: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
  if (!isMatch) {
    throw new BadRequestError('Current password is incorrect');
  }

  const hashedNewPassword = await bcrypt.hash(newPass, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedNewPassword },
    }),
    prisma.refreshToken.deleteMany({
      where: { userId },
    }),
  ]);

  logAudit(userId, 'PASSWORD_CHANGE', 'Password changed successfully', ipAddress);
};

/**
 * Get User by ID
 */
export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return toUserDto(user);
};

/**
 * Update User Roles
 */
export const updateRoles = async (userId: number, roles: Role[], ipAddress?: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { roles },
  });

  logAudit(
    userId,
    'UPDATE_ROLES',
    `Roles updated to: ${roles.join(', ')}`,
    ipAddress
  );

  return toUserDto(updatedUser);
};

/**
 * Enable/Disable Account
 */
export const toggleStatus = async (userId: number, enabled: boolean, ipAddress?: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { enabled },
  });

  const action = enabled ? 'ENABLE_USER' : 'DISABLE_USER';
  logAudit(userId, action, `User account ${enabled ? 'enabled' : 'disabled'}`, ipAddress);

  return toUserDto(updatedUser);
};
