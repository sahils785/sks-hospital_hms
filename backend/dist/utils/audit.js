"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = void 0;
const db_1 = __importDefault(require("../config/db"));
/**
 * Asynchronously logs system transactions and updates to the database
 */
const logAudit = (userId, action, details, ipAddress) => {
    db_1.default.auditLog
        .create({
        data: {
            userId,
            action,
            details,
            ipAddress: ipAddress || null,
        },
    })
        .catch((err) => {
        console.error(`[Audit Failure] Failed to write audit event: ${err.message}`);
    });
};
exports.logAudit = logAudit;
