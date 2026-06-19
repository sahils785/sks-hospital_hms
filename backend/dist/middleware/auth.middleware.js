"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const JWT_SECRET = process.env.JWT_SECRET || 'dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBob3NwaXRhbCBtYW5hZ2VtZW50IHN5c3RlbSBqd3QgdG9rZW4gZ2VuZXJhdGlvbg==';
/**
 * Authentication Middleware
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new errors_1.UnauthorizedError('Missing or invalid authorization header'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        next(new errors_1.UnauthorizedError('Invalid or expired authentication token'));
    }
};
exports.authenticate = authenticate;
/**
 * Role-Based Access Control (RBAC) Middleware
 */
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.UnauthorizedError('User authentication required'));
        }
        const hasAccess = req.user.roles.some((role) => allowedRoles.includes(role));
        if (!hasAccess) {
            return next(new errors_1.ForbiddenError('You do not have permission to access this resource'));
        }
        next();
    };
};
exports.authorize = authorize;
