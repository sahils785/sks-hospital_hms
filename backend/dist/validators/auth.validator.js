"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordValidator = exports.registerValidator = exports.loginValidator = exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const errors_1 = require("../utils/errors");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMsg = errors
            .array()
            .map((err) => `${err.type === 'field' ? err.path : ''}: ${err.msg}`)
            .join(', ');
        return next(new errors_1.BadRequestError(errorMsg));
    }
    next();
};
exports.validateRequest = validateRequest;
exports.loginValidator = [
    (0, express_validator_1.body)('usernameOrEmail')
        .notEmpty()
        .withMessage('Username or Email is required')
        .trim(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
    exports.validateRequest,
];
exports.registerValidator = [
    (0, express_validator_1.body)('username')
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .trim(),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('A valid email address is required')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('firstName')
        .notEmpty()
        .withMessage('First name is required')
        .trim(),
    (0, express_validator_1.body)('lastName')
        .notEmpty()
        .withMessage('Last name is required')
        .trim(),
    (0, express_validator_1.body)('phone')
        .optional()
        .isString()
        .withMessage('Phone must be a string')
        .trim(),
    exports.validateRequest,
];
exports.changePasswordValidator = [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long'),
    exports.validateRequest,
];
