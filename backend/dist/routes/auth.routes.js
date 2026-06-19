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
const express_1 = require("express");
const authController = __importStar(require("../controllers/auth.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Public routes
router.post('/login', auth_validator_1.loginValidator, authController.login);
router.post('/register', auth_validator_1.registerValidator, authController.register);
router.post('/refresh', authController.refresh);
// Protected routes
router.post('/logout', auth_middleware_1.authenticate, authController.logout);
router.post('/change-password', auth_middleware_1.authenticate, auth_validator_1.changePasswordValidator, authController.changePassword);
router.get('/profile', auth_middleware_1.authenticate, authController.getProfile);
// Admin-only routes
router.put('/users/:id/roles', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.Role.ADMIN]), authController.updateUserRoles);
router.put('/users/:id/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.Role.ADMIN]), authController.toggleUserStatus);
exports.default = router;
