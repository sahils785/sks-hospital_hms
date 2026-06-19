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
exports.getPatientInvoices = exports.getAllInvoices = exports.getInvoice = exports.processPayment = exports.createInvoice = void 0;
const billingService = __importStar(require("../services/billing.service"));
const createInvoice = async (req, res, next) => {
    try {
        const result = await billingService.createInvoice(req.body);
        res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createInvoice = createInvoice;
const processPayment = async (req, res, next) => {
    try {
        const result = await billingService.processPayment(req.body);
        res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.processPayment = processPayment;
const getInvoice = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await billingService.getInvoiceById(id);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInvoice = getInvoice;
const getAllInvoices = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || '0', 10);
        const size = parseInt(req.query.size || '20', 10);
        const status = req.query.status;
        const result = await billingService.getAllInvoices(page, size, status);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllInvoices = getAllInvoices;
const getPatientInvoices = async (req, res, next) => {
    try {
        const patientId = parseInt(req.params.patientId, 10);
        const page = parseInt(req.query.page || '0', 10);
        const size = parseInt(req.query.size || '20', 10);
        const result = await billingService.getPatientInvoices(patientId, page, size);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPatientInvoices = getPatientInvoices;
