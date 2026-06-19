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
exports.confirmAppointment = exports.completeAppointment = exports.cancelAppointment = exports.rescheduleAppointment = exports.getTodayAppointments = exports.getDoctorAppointments = exports.getPatientAppointments = exports.getAllAppointments = exports.getAppointment = exports.bookAppointment = void 0;
const appointmentService = __importStar(require("../services/appointment.service"));
const bookAppointment = async (req, res, next) => {
    try {
        const result = await appointmentService.bookAppointment(req.body);
        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.bookAppointment = bookAppointment;
const getAppointment = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await appointmentService.getAppointmentById(id);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAppointment = getAppointment;
const getAllAppointments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || '0', 10);
        const size = parseInt(req.query.size || '20', 10);
        const status = req.query.status;
        const result = await appointmentService.getAllAppointments(page, size, status);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllAppointments = getAllAppointments;
const getPatientAppointments = async (req, res, next) => {
    try {
        const patientId = parseInt(req.params.patientId, 10);
        const page = parseInt(req.query.page || '0', 10);
        const size = parseInt(req.query.size || '20', 10);
        const result = await appointmentService.getPatientAppointments(patientId, page, size);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPatientAppointments = getPatientAppointments;
const getDoctorAppointments = async (req, res, next) => {
    try {
        const doctorId = parseInt(req.params.doctorId, 10);
        const page = parseInt(req.query.page || '0', 10);
        const size = parseInt(req.query.size || '20', 10);
        const result = await appointmentService.getDoctorAppointments(doctorId, page, size);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDoctorAppointments = getDoctorAppointments;
const getTodayAppointments = async (req, res, next) => {
    try {
        const doctorId = parseInt(req.params.doctorId, 10);
        const result = await appointmentService.getTodayAppointments(doctorId);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTodayAppointments = getTodayAppointments;
const rescheduleAppointment = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { newDateTime } = req.body;
        if (!newDateTime) {
            return res.status(400).json({
                success: false,
                message: 'Request body must include "newDateTime"',
            });
        }
        const result = await appointmentService.rescheduleAppointment(id, newDateTime);
        res.status(200).json({
            success: true,
            message: 'Appointment rescheduled successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.rescheduleAppointment = rescheduleAppointment;
const cancelAppointment = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { reason } = req.body || {};
        const result = await appointmentService.cancelAppointment(id, reason);
        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelAppointment = cancelAppointment;
const completeAppointment = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { consultationNotes } = req.body || {};
        const result = await appointmentService.completeAppointment(id, consultationNotes);
        res.status(200).json({
            success: true,
            message: 'Appointment completed successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.completeAppointment = completeAppointment;
const confirmAppointment = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await appointmentService.confirmAppointment(id);
        res.status(200).json({
            success: true,
            message: 'Appointment confirmed successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.confirmAppointment = confirmAppointment;
