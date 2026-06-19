"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    errorCode;
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message, errorCode) {
        super(message, 400, errorCode);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access', errorCode) {
        super(message, 401, errorCode);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Access denied', errorCode) {
        super(message, 403, errorCode);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found', errorCode) {
        super(message, 404, errorCode);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message, errorCode) {
        super(message, 409, errorCode);
    }
}
exports.ConflictError = ConflictError;
