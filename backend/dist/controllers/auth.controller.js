"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUserStatus = exports.updateUserRoles = exports.getProfile = exports.changePassword = exports.logout = exports.refresh = exports.register = exports.login = void 0;
const authService = __importStar(require("../services/auth.service"));
const login = async (req, res, next) => {
    try {
        const { usernameOrEmail, password } = req.body;
        const ipAddress = req.ip;
        const result = await authService.loginUser(usernameOrEmail, password, ipAddress);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const register = async (req, res, next) => {
    try {
        const { username, email, password, firstName, lastName, phone, roles } = req.body;
        const ipAddress = req.ip;
        const result = await authService.registerUser({
            username,
            email,
            passwordHash: password, // Service will hash this password
            firstName,
            lastName,
            phone,
            roles,
        }, ipAddress);
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const ipAddress = req.ip;
        const result = await authService.refreshUserToken(refreshToken, ipAddress);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
const logout = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const ipAddress = req.ip;
        await authService.logoutUser(userId, ipAddress);
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        const ipAddress = req.ip;
        await authService.changeUserPassword(userId, currentPassword, newPassword, ipAddress);
        res.status(200).json({
            success: true,
            message: 'Password changed successfully. Please log in again.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await authService.getUserById(userId);
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateUserRoles = async (req, res, next) => {
    try {
        const targetUserId = parseInt(req.params.id, 10);
        const { roles } = req.body;
        const ipAddress = req.ip;
        const result = await authService.updateRoles(targetUserId, roles, ipAddress);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserRoles = updateUserRoles;
const toggleUserStatus = async (req, res, next) => {
    try {
        const targetUserId = parseInt(req.params.id, 10);
        const { enabled } = req.body;
        const ipAddress = req.ip;
        const result = await authService.toggleStatus(targetUserId, enabled, ipAddress);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleUserStatus = toggleUserStatus;
