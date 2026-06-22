"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPrescriptions = exports.getDoctorPrescriptions = exports.getPatientPrescriptions = exports.getPrescriptionByAppointmentId = exports.getPrescriptionById = exports.createPrescription = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const notification_service_1 = require("./notification.service");
const createPrescription = async (data) => {
    let patientId = data.patientId;
    let doctorId = data.doctorId;
    if (!patientId && data.patientName) {
        const parts = data.patientName.trim().split(/\s+/);
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ');
        let found = await db_1.default.patient.findFirst({
            where: {
                firstName: { equals: firstName, mode: 'insensitive' },
                lastName: { equals: lastName, mode: 'insensitive' }
            }
        });
        if (!found) {
            found = await db_1.default.patient.findFirst({
                where: {
                    OR: [
                        { firstName: { equals: firstName, mode: 'insensitive' } },
                        { lastName: { equals: firstName, mode: 'insensitive' } }
                    ]
                }
            });
        }
        if (found) {
            patientId = found.id;
        }
        else {
            const email = `${firstName.toLowerCase()}.${(lastName || 'patient').toLowerCase()}@hospital.com`;
            const uniqueUsername = `${firstName.toLowerCase()}_${(lastName || 'patient').toLowerCase()}_${Date.now().toString().slice(-4)}`;
            const user = await db_1.default.user.create({
                data: {
                    username: uniqueUsername,
                    email,
                    passwordHash: '$2b$10$tJ24.XnL4hM2z.b2i0Wk7uqB.n/5fF78n.lSveO1Y.B.m2f.Z2C5m', // Patient@123
                    firstName,
                    lastName: lastName || 'Patient',
                    roles: ['PATIENT']
                }
            });
            const newPatient = await db_1.default.patient.create({
                data: {
                    userId: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                }
            });
            patientId = newPatient.id;
        }
    }
    if (!doctorId && data.doctorName) {
        const cleanName = data.doctorName.replace(/^(dr\.?\s*)/i, '').trim();
        const parts = cleanName.split(/\s+/);
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ');
        let found = await db_1.default.doctor.findFirst({
            where: {
                firstName: { equals: firstName, mode: 'insensitive' },
                lastName: { equals: lastName, mode: 'insensitive' }
            }
        });
        if (!found) {
            found = await db_1.default.doctor.findFirst({
                where: {
                    OR: [
                        { firstName: { equals: firstName, mode: 'insensitive' } },
                        { lastName: { equals: firstName, mode: 'insensitive' } }
                    ]
                }
            });
        }
        if (found) {
            doctorId = found.id;
        }
        else {
            const fallback = await db_1.default.doctor.findFirst();
            if (fallback) {
                doctorId = fallback.id;
            }
            else {
                throw new errors_1.NotFoundError('No doctors registered in the system');
            }
        }
    }
    if (!patientId) {
        throw new errors_1.BadRequestError('Patient ID or Patient Name is required');
    }
    if (!doctorId) {
        throw new errors_1.BadRequestError('Doctor ID or Doctor Name is required');
    }
    const patient = await db_1.default.patient.findUnique({
        where: { id: patientId },
    });
    if (!patient) {
        throw new errors_1.NotFoundError('Patient not found');
    }
    const doctor = await db_1.default.doctor.findUnique({
        where: { id: doctorId },
    });
    if (!doctor) {
        throw new errors_1.NotFoundError('Doctor not found');
    }
    const rawMedications = [...(data.medications || [])];
    if (data.medicines && Array.isArray(data.medicines)) {
        data.medicines.forEach((m) => {
            rawMedications.push({
                medicineName: m.name,
                dosage: m.dosage,
                frequency: m.frequency,
                duration: m.duration,
                instructions: m.instructions
            });
        });
    }
    const prescription = await db_1.default.$transaction(async (tx) => {
        const created = await tx.prescription.create({
            data: {
                patientId: patientId,
                patientName: `${patient.firstName} ${patient.lastName}`,
                doctorId: doctorId,
                doctorName: `${doctor.firstName} ${doctor.lastName}`,
                appointmentId: data.appointmentId || null,
                diagnosis: data.diagnosis || null,
                notes: data.notes || null,
            },
        });
        if (rawMedications && rawMedications.length > 0) {
            await tx.medication.createMany({
                data: rawMedications.map((m) => ({
                    prescriptionId: created.id,
                    medicineName: m.medicineName,
                    dosage: m.dosage || null,
                    frequency: m.frequency || null,
                    duration: m.duration || null,
                    instructions: m.instructions || null,
                })),
            });
        }
        return await tx.prescription.findUnique({
            where: { id: created.id },
            include: { medications: true },
        });
    });
    // Notify patient
    await (0, notification_service_1.createNotification)(patient.userId, `A new prescription has been issued by Dr. ${doctor.lastName} (Diagnosis: ${data.diagnosis || 'General Checkup'})`, 'PRESCRIPTION');
    return prescription;
};
exports.createPrescription = createPrescription;
const getPrescriptionById = async (id) => {
    const prescription = await db_1.default.prescription.findUnique({
        where: { id },
        include: { medications: true },
    });
    if (!prescription) {
        throw new errors_1.NotFoundError('Prescription not found');
    }
    return prescription;
};
exports.getPrescriptionById = getPrescriptionById;
const getPrescriptionByAppointmentId = async (appointmentId) => {
    const prescription = await db_1.default.prescription.findUnique({
        where: { appointmentId },
        include: { medications: true },
    });
    if (!prescription) {
        throw new errors_1.NotFoundError('No prescription found for this appointment');
    }
    return prescription;
};
exports.getPrescriptionByAppointmentId = getPrescriptionByAppointmentId;
const getPatientPrescriptions = async (patientId, page = 0, size = 20) => {
    const skip = page * size;
    const take = size;
    const [content, totalElements] = await db_1.default.$transaction([
        db_1.default.prescription.findMany({
            where: { patientId },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: { medications: true },
        }),
        db_1.default.prescription.count({ where: { patientId } }),
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
exports.getPatientPrescriptions = getPatientPrescriptions;
const getDoctorPrescriptions = async (doctorId, page = 0, size = 20) => {
    const skip = page * size;
    const take = size;
    const [content, totalElements] = await db_1.default.$transaction([
        db_1.default.prescription.findMany({
            where: { doctorId },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: { medications: true },
        }),
        db_1.default.prescription.count({ where: { doctorId } }),
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
exports.getDoctorPrescriptions = getDoctorPrescriptions;
const getAllPrescriptions = async (page = 0, size = 20) => {
    const skip = page * size;
    const take = size;
    const [content, totalElements] = await db_1.default.$transaction([
        db_1.default.prescription.findMany({
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: { medications: true },
        }),
        db_1.default.prescription.count(),
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
exports.getAllPrescriptions = getAllPrescriptions;
