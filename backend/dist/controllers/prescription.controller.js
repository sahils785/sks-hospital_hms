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
exports.getAllPrescriptions = exports.getDoctorPrescriptions = exports.getPatientPrescriptions = exports.getPrescriptionByAppointment = exports.getPrescription = exports.createPrescription = void 0;
const prescriptionService = __importStar(require("../services/prescription.service"));
const createPrescription = async (req, res, next) => {
    try {
        const result = await prescriptionService.createPrescription(req.body);
        res.status(201).json({
            success: true,
            message: 'Prescription created successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPrescription = createPrescription;
const getPrescription = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await prescriptionService.getPrescriptionById(id);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPrescription = getPrescription;
const getPrescriptionByAppointment = async (req, res, next) => {
    try {
        const appointmentId = parseInt(req.params.appointmentId, 10);
        const result = await prescriptionService.getPrescriptionByAppointmentId(appointmentId);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPrescriptionByAppointment = getPrescriptionByAppointment;
const getPatientPrescriptions = async (req, res, next) => {
    try {
        const patientId = parseInt(req.params.patientId, 10);
        const page = parseInt(req.query.page || '0', 10);
        const size = parseInt(req.query.size || '20', 10);
        const result = await prescriptionService.getPatientPrescriptions(patientId, page, size);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPatientPrescriptions = getPatientPrescriptions;
const getDoctorPrescriptions = async (req, res, next) => {
    try {
        const doctorId = parseInt(req.params.doctorId, 10);
        const page = parseInt(req.query.page || '0', 10);
        const size = parseInt(req.query.size || '20', 10);
        const result = await prescriptionService.getDoctorPrescriptions(doctorId, page, size);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDoctorPrescriptions = getDoctorPrescriptions;
const getAllPrescriptions = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || '0', 10);
        const size = parseInt(req.query.size || '20', 10);
        const result = await prescriptionService.getAllPrescriptions(page, size);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllPrescriptions = getAllPrescriptions;
