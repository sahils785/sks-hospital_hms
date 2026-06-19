"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleStatus = exports.updateRoles = exports.getUserById = exports.changeUserPassword = exports.logoutUser = exports.refreshUserToken = exports.registerUser = exports.loginUser = exports.createRefreshToken = exports.generateAccessToken = exports.toUserDto = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const audit_1 = require("../utils/audit");
const client_1 = require("@prisma/client");
const JWT_SECRET = process.env.JWT_SECRET || 'dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBob3NwaXRhbCBtYW5hZ2VtZW50IHN5c3RlbSBqd3QgdG9rZW4gZ2VuZXJhdGlvbg==';
const ACCESS_EXPIRATION = parseInt(process.env.JWT_ACCESS_EXPIRATION || '900000', 10); // 15 mins
const REFRESH_EXPIRATION = parseInt(process.env.JWT_REFRESH_EXPIRATION || '604800000', 10); // 7 days
const toUserDto = (user) => ({
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
exports.toUserDto = toUserDto;
/**
 * Generate Access Token
 */
const generateAccessToken = (user) => {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
    }, JWT_SECRET, { expiresIn: `${ACCESS_EXPIRATION}ms` });
};
exports.generateAccessToken = generateAccessToken;
/**
 * Generate and save Refresh Token
 */
const createRefreshToken = async (userId) => {
    const token = jsonwebtoken_1.default.sign({ id: userId }, JWT_SECRET, {
        expiresIn: `${REFRESH_EXPIRATION}ms`,
    });
    const expiryDate = new Date(Date.now() + REFRESH_EXPIRATION);
    await db_1.default.refreshToken.create({
        data: {
            token,
            userId,
            expiryDate,
        },
    });
    return token;
};
exports.createRefreshToken = createRefreshToken;
/**
 * Login Service
 */
const loginUser = async (usernameOrEmail, password, ipAddress) => {
    const user = await db_1.default.user.findFirst({
        where: {
            OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        },
    });
    if (!user) {
        throw new errors_1.UnauthorizedError('Invalid credentials');
    }
    // Account lock check
    if (user.accountLocked) {
        const isLockExpired = user.lockTime && new Date().getTime() - new Date(user.lockTime).getTime() > 30 * 60 * 1000;
        if (isLockExpired) {
            // Reset lock details
            await db_1.default.user.update({
                where: { id: user.id },
                data: {
                    accountLocked: false,
                    failedLoginAttempts: 0,
                    lockTime: null,
                },
            });
        }
        else {
            throw new errors_1.UnauthorizedError('Account is locked due to multiple failed login attempts. Try again after 30 minutes.');
        }
    }
    // Validate password
    const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!isMatch) {
        const nextAttempts = user.failedLoginAttempts + 1;
        const shouldLock = nextAttempts >= 5;
        await db_1.default.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: nextAttempts,
                accountLocked: shouldLock,
                lockTime: shouldLock ? new Date() : null,
            },
        });
        (0, audit_1.logAudit)(user.id, 'LOGIN_FAILED', 'Failed login attempt', ipAddress);
        throw new errors_1.UnauthorizedError('Invalid credentials');
    }
    // Check user is enabled
    if (!user.enabled) {
        throw new errors_1.UnauthorizedError('Account is disabled. Contact system administrator.');
    }
    // Successful Login: Reset counters
    await db_1.default.user.update({
        where: { id: user.id },
        data: {
            failedLoginAttempts: 0,
            accountLocked: false,
            lockTime: null,
        },
    });
    const accessToken = (0, exports.generateAccessToken)(user);
    const refreshToken = await (0, exports.createRefreshToken)(user.id);
    (0, audit_1.logAudit)(user.id, 'LOGIN_SUCCESS', 'Logged in successfully', ipAddress);
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        user: (0, exports.toUserDto)(user),
    };
};
exports.loginUser = loginUser;
/**
 * Register Service
 */
const registerUser = async (data, ipAddress) => {
    const existingUsername = await db_1.default.user.findUnique({
        where: { username: data.username },
    });
    if (existingUsername) {
        throw new errors_1.BadRequestError('Username is already taken');
    }
    const existingEmail = await db_1.default.user.findUnique({
        where: { email: data.email },
    });
    if (existingEmail) {
        throw new errors_1.BadRequestError('Email is already registered');
    }
    const hashedPassword = await bcrypt_1.default.hash(data.passwordHash, 10);
    const userRoles = data.roles && data.roles.length > 0 ? data.roles : [client_1.Role.PATIENT];
    const newUser = await db_1.default.user.create({
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
    if (userRoles.includes(client_1.Role.PATIENT)) {
        await db_1.default.patient.create({
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
    if (userRoles.includes(client_1.Role.DOCTOR)) {
        await db_1.default.doctor.create({
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
    (0, audit_1.logAudit)(newUser.id, 'REGISTER_SUCCESS', `New user registered with roles: ${userRoles.join(', ')}`, ipAddress);
    return (0, exports.toUserDto)(newUser);
};
exports.registerUser = registerUser;
/**
 * Token Refresh Service
 */
const refreshUserToken = async (token, ipAddress) => {
    const savedToken = await db_1.default.refreshToken.findUnique({
        where: { token },
        include: { user: true },
    });
    if (!savedToken) {
        throw new errors_1.UnauthorizedError('Invalid refresh token');
    }
    if (new Date() > savedToken.expiryDate) {
        await db_1.default.refreshToken.delete({ where: { token } });
        throw new errors_1.UnauthorizedError('Expired refresh token');
    }
    // Create new tokens (Token rotation)
    await db_1.default.refreshToken.delete({ where: { token } });
    const newAccessToken = (0, exports.generateAccessToken)(savedToken.user);
    const newRefreshToken = await (0, exports.createRefreshToken)(savedToken.user.id);
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenType: 'Bearer',
    };
};
exports.refreshUserToken = refreshUserToken;
/**
 * Logout Service
 */
const logoutUser = async (userId, ipAddress) => {
    const user = await db_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new errors_1.NotFoundError('User not found');
    }
    await db_1.default.refreshToken.deleteMany({
        where: { userId },
    });
    (0, audit_1.logAudit)(userId, 'LOGOUT_SUCCESS', 'Logged out successfully', ipAddress);
};
exports.logoutUser = logoutUser;
/**
 * Change Password Service
 */
const changeUserPassword = async (userId, currentPass, newPass, ipAddress) => {
    const user = await db_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const isMatch = await bcrypt_1.default.compare(currentPass, user.passwordHash);
    if (!isMatch) {
        throw new errors_1.BadRequestError('Current password is incorrect');
    }
    const hashedNewPassword = await bcrypt_1.default.hash(newPass, 10);
    await db_1.default.$transaction([
        db_1.default.user.update({
            where: { id: userId },
            data: { passwordHash: hashedNewPassword },
        }),
        db_1.default.refreshToken.deleteMany({
            where: { userId },
        }),
    ]);
    (0, audit_1.logAudit)(userId, 'PASSWORD_CHANGE', 'Password changed successfully', ipAddress);
};
exports.changeUserPassword = changeUserPassword;
/**
 * Get User by ID
 */
const getUserById = async (id) => {
    const user = await db_1.default.user.findUnique({ where: { id } });
    if (!user) {
        throw new errors_1.NotFoundError('User not found');
    }
    return (0, exports.toUserDto)(user);
};
exports.getUserById = getUserById;
/**
 * Update User Roles
 */
const updateRoles = async (userId, roles, ipAddress) => {
    const user = await db_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const updatedUser = await db_1.default.user.update({
        where: { id: userId },
        data: { roles },
    });
    (0, audit_1.logAudit)(userId, 'UPDATE_ROLES', `Roles updated to: ${roles.join(', ')}`, ipAddress);
    return (0, exports.toUserDto)(updatedUser);
};
exports.updateRoles = updateRoles;
/**
 * Enable/Disable Account
 */
const toggleStatus = async (userId, enabled, ipAddress) => {
    const user = await db_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const updatedUser = await db_1.default.user.update({
        where: { id: userId },
        data: { enabled },
    });
    const action = enabled ? 'ENABLE_USER' : 'DISABLE_USER';
    (0, audit_1.logAudit)(userId, action, `User account ${enabled ? 'enabled' : 'disabled'}`, ipAddress);
    return (0, exports.toUserDto)(updatedUser);
};
exports.toggleStatus = toggleStatus;
