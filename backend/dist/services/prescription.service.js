"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDoctorPrescriptions = exports.getPatientPrescriptions = exports.getPrescriptionByAppointmentId = exports.getPrescriptionById = exports.createPrescription = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const notification_service_1 = require("./notification.service");
const createPrescription = async (data) => {
    const patient = await db_1.default.patient.findUnique({
        where: { id: data.patientId },
    });
    if (!patient) {
        throw new errors_1.NotFoundError('Patient not found');
    }
    const doctor = await db_1.default.doctor.findUnique({
        where: { id: data.doctorId },
    });
    if (!doctor) {
        throw new errors_1.NotFoundError('Doctor not found');
    }
    const prescription = await db_1.default.$transaction(async (tx) => {
        const created = await tx.prescription.create({
            data: {
                patientId: data.patientId,
                patientName: `${patient.firstName} ${patient.lastName}`,
                doctorId: data.doctorId,
                doctorName: `${doctor.firstName} ${doctor.lastName}`,
                appointmentId: data.appointmentId || null,
                diagnosis: data.diagnosis || null,
                notes: data.notes || null,
            },
        });
        if (data.medications && data.medications.length > 0) {
            await tx.medication.createMany({
                data: data.medications.map((m) => ({
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
