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
exports.addEmergencyContact = exports.addMedicalHistory = exports.updatePatient = exports.getAllPatients = exports.getPatientByUserId = exports.getPatient = exports.createPatient = void 0;
const patientService = __importStar(require("../services/patient.service"));
const createPatient = async (req, res, next) => {
    try {
        const result = await patientService.createPatient(req.body);
        res.status(201).json({
            success: true,
            message: 'Patient registered successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPatient = createPatient;
const getPatient = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await patientService.getPatientById(id);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPatient = getPatient;
const getPatientByUserId = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const result = await patientService.getPatientByUserId(userId);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPatientByUserId = getPatientByUserId;
const getAllPatients = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || '0', 10);
        const size = parseInt(req.query.size || '20', 10);
        const search = req.query.search;
        const sortBy = req.query.sortBy || 'createdAt';
        const result = await patientService.getAllPatients(page, size, search, sortBy);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllPatients = getAllPatients;
const updatePatient = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await patientService.updatePatient(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Patient updated successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePatient = updatePatient;
const addMedicalHistory = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await patientService.addMedicalHistory(id, req.body);
        res.status(201).json({
            success: true,
            message: 'Medical history added successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addMedicalHistory = addMedicalHistory;
const addEmergencyContact = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await patientService.addEmergencyContact(id, req.body);
        res.status(201).json({
            success: true,
            message: 'Emergency contact added successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addEmergencyContact = addEmergencyContact;
