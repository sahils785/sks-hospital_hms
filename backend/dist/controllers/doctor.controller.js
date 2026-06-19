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
exports.getDepartments = exports.getSpecializations = exports.getAvailability = exports.updateDoctor = exports.getAllDoctors = exports.getDoctorByUserId = exports.getDoctor = exports.createDoctor = void 0;
const doctorService = __importStar(require("../services/doctor.service"));
const createDoctor = async (req, res, next) => {
    try {
        const result = await doctorService.createDoctor(req.body);
        res.status(201).json({
            success: true,
            message: 'Doctor profile created successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createDoctor = createDoctor;
const getDoctor = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await doctorService.getDoctorById(id);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDoctor = getDoctor;
const getDoctorByUserId = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const result = await doctorService.getDoctorByUserId(userId);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDoctorByUserId = getDoctorByUserId;
const getAllDoctors = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || '0', 10);
        const size = parseInt(req.query.size || '20', 10);
        const search = req.query.search;
        const sortBy = req.query.sortBy || 'firstName';
        const result = await doctorService.getAllDoctors(page, size, search, sortBy);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllDoctors = getAllDoctors;
const updateDoctor = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await doctorService.updateDoctor(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Doctor profile updated successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDoctor = updateDoctor;
const getAvailability = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const date = req.query.date;
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Query parameter "date" (YYYY-MM-DD) is required',
            });
        }
        const result = await doctorService.getAvailability(id, date);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAvailability = getAvailability;
const getSpecializations = async (req, res, next) => {
    try {
        const result = await doctorService.getAllSpecializations();
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSpecializations = getSpecializations;
const getDepartments = async (req, res, next) => {
    try {
        const result = await doctorService.getAllDepartments();
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDepartments = getDepartments;
