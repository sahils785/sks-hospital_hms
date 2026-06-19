"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.stack || err.message}`);
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode,
        });
    }
    // Handle express-validator parsing errors (or others) if they leak here
    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
};
exports.errorHandler = errorHandler;
