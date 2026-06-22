"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEmergencyContact = exports.addMedicalHistory = exports.updatePatient = exports.getAllPatients = exports.getPatientByUserId = exports.getPatientById = exports.createPatient = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const createPatient = async (data) => {
    let userId = data.userId;
    if (!userId) {
        const existingUser = await db_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            userId = existingUser.id;
        }
        else {
            const username = `${data.firstName.toLowerCase()}_${data.lastName.toLowerCase()}_${Date.now().toString().slice(-4)}`;
            const user = await db_1.default.user.create({
                data: {
                    username,
                    email: data.email,
                    passwordHash: '$2b$10$tJ24.XnL4hM2z.b2i0Wk7uqB.n/5fF78n.lSveO1Y.B.m2f.Z2C5m', // Patient@123
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone || null,
                    roles: ['PATIENT']
                }
            });
            userId = user.id;
        }
    }
    // Check if profile already exists for this user
    const existing = await db_1.default.patient.findUnique({
        where: { userId },
    });
    if (existing) {
        throw new errors_1.BadRequestError('Patient profile already exists for this user');
    }
    return await db_1.default.patient.create({
        data: {
            userId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || null,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            gender: data.gender || null,
            bloodGroup: data.bloodGroup || null,
            address: data.address || null,
            insuranceProvider: data.insuranceProvider || null,
            insurancePolicyNumber: data.insurancePolicyNumber || null,
            insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
            allergies: data.allergies || null,
        },
    });
};
exports.createPatient = createPatient;
const getPatientById = async (id) => {
    const patient = await db_1.default.patient.findUnique({
        where: { id },
        include: {
            medicalHistories: true,
            emergencyContacts: true,
        },
    });
    if (!patient) {
        throw new errors_1.NotFoundError('Patient not found');
    }
    return patient;
};
exports.getPatientById = getPatientById;
const getPatientByUserId = async (userId) => {
    const patient = await db_1.default.patient.findUnique({
        where: { userId },
        include: {
            medicalHistories: true,
            emergencyContacts: true,
        },
    });
    if (!patient) {
        throw new errors_1.NotFoundError('Patient profile not found for this user ID');
    }
    return patient;
};
exports.getPatientByUserId = getPatientByUserId;
const getAllPatients = async (page = 0, size = 20, search, sortBy = 'createdAt') => {
    const skip = page * size;
    const take = size;
    // Build filter
    const where = {};
    if (search && search.trim() !== '') {
        where.OR = [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
        ];
    }
    // Handle valid fields for sorting
    const validSortFields = ['createdAt', 'firstName', 'lastName', 'id'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const [content, totalElements] = await db_1.default.$transaction([
        db_1.default.patient.findMany({
            where,
            skip,
            take,
            orderBy: { [actualSortBy]: 'desc' },
        }),
        db_1.default.patient.count({ where }),
    ]);
    const totalPages = Math.ceil(totalElements / size);
    return {
        content,
        page,
        size,
        totalElements,
        totalPages,
        first: page === 0,
        last: page >= totalPages - 1,
    };
};
exports.getAllPatients = getAllPatients;
const updatePatient = async (id, data) => {
    const patient = await db_1.default.patient.findUnique({ where: { id } });
    if (!patient) {
        throw new errors_1.NotFoundError('Patient not found');
    }
    return await db_1.default.patient.update({
        where: { id },
        data: {
            ...data,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : patient.dateOfBirth,
            insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : patient.insuranceExpiry,
        },
    });
};
exports.updatePatient = updatePatient;
const addMedicalHistory = async (patientId, data) => {
    const patient = await db_1.default.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
        throw new errors_1.NotFoundError('Patient not found');
    }
    return await db_1.default.medicalHistory.create({
        data: {
            patientId,
            condition: data.condition,
            diagnosisDate: data.diagnosisDate ? new Date(data.diagnosisDate) : null,
            treatment: data.treatment || null,
            notes: data.notes || null,
        },
    });
};
exports.addMedicalHistory = addMedicalHistory;
const addEmergencyContact = async (patientId, data) => {
    const patient = await db_1.default.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
        throw new errors_1.NotFoundError('Patient not found');
    }
    return await db_1.default.emergencyContact.create({
        data: {
            patientId,
            name: data.name,
            relationship: data.relationship,
            phone: data.phone,
            email: data.email || null,
        },
    });
};
exports.addEmergencyContact = addEmergencyContact;
