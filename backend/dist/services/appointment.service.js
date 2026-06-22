"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmAppointment = exports.completeAppointment = exports.cancelAppointment = exports.rescheduleAppointment = exports.getTodayAppointments = exports.getDoctorAppointments = exports.getPatientAppointments = exports.getAllAppointments = exports.getAppointmentById = exports.bookAppointment = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const notification_service_1 = require("./notification.service");
const client_1 = require("@prisma/client");
const bookAppointment = async (data) => {
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
        include: { user: true },
    });
    if (!patient) {
        throw new errors_1.NotFoundError('Patient not found');
    }
    const doctor = await db_1.default.doctor.findUnique({
        where: { id: doctorId },
        include: { user: true, schedules: true },
    });
    if (!doctor) {
        throw new errors_1.NotFoundError('Doctor not found');
    }
    const aptDate = new Date(data.appointmentDateTime);
    // Validate doctor availability (simple validation: ensure date is not in past, and slot doesn't conflict)
    if (aptDate < new Date()) {
        throw new errors_1.BadRequestError('Cannot book appointments in the past');
    }
    // Check overlap
    const conflict = await db_1.default.appointment.findFirst({
        where: {
            doctorId: doctorId,
            appointmentDateTime: aptDate,
            status: {
                not: client_1.AppointmentStatus.CANCELLED,
            },
        },
    });
    if (conflict) {
        throw new errors_1.BadRequestError('Doctor is already booked for this time slot');
    }
    const durationMinutes = 30; // default duration
    const endDateTime = new Date(aptDate.getTime() + durationMinutes * 60 * 1000);
    const appointment = await db_1.default.appointment.create({
        data: {
            patientId: patientId,
            patientName: `${patient.firstName} ${patient.lastName}`,
            patientEmail: patient.email,
            doctorId: doctorId,
            doctorName: `${doctor.firstName} ${doctor.lastName}`,
            appointmentDateTime: aptDate,
            endDateTime,
            status: client_1.AppointmentStatus.SCHEDULED,
            reason: data.reason || null,
        },
    });
    // Create notifications
    await (0, notification_service_1.createNotification)(patient.userId, `Your appointment with Dr. ${doctor.lastName} is booked for ${aptDate.toLocaleString()}`, 'APPOINTMENT');
    await (0, notification_service_1.createNotification)(doctor.userId, `New appointment booked: ${patient.firstName} ${patient.lastName} on ${aptDate.toLocaleString()}`, 'APPOINTMENT');
    return appointment;
};
exports.bookAppointment = bookAppointment;
const getAppointmentById = async (id) => {
    const appointment = await db_1.default.appointment.findUnique({
        where: { id },
    });
    if (!appointment) {
        throw new errors_1.NotFoundError('Appointment not found');
    }
    return appointment;
};
exports.getAppointmentById = getAppointmentById;
const getAllAppointments = async (page = 0, size = 20, status) => {
    const skip = page * size;
    const take = size;
    const where = {};
    if (status) {
        where.status = status.toUpperCase();
    }
    const [content, totalElements] = await db_1.default.$transaction([
        db_1.default.appointment.findMany({
            where,
            skip,
            take,
            orderBy: { appointmentDateTime: 'desc' },
        }),
        db_1.default.appointment.count({ where }),
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
exports.getAllAppointments = getAllAppointments;
const getPatientAppointments = async (patientId, page = 0, size = 20) => {
    const skip = page * size;
    const take = size;
    const [content, totalElements] = await db_1.default.$transaction([
        db_1.default.appointment.findMany({
            where: { patientId },
            skip,
            take,
            orderBy: { appointmentDateTime: 'desc' },
        }),
        db_1.default.appointment.count({ where: { patientId } }),
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
exports.getPatientAppointments = getPatientAppointments;
const getDoctorAppointments = async (doctorId, page = 0, size = 20) => {
    const skip = page * size;
    const take = size;
    const [content, totalElements] = await db_1.default.$transaction([
        db_1.default.appointment.findMany({
            where: { doctorId },
            skip,
            take,
            orderBy: { appointmentDateTime: 'desc' },
        }),
        db_1.default.appointment.count({ where: { doctorId } }),
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
exports.getDoctorAppointments = getDoctorAppointments;
const getTodayAppointments = async (doctorId) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    return await db_1.default.appointment.findMany({
        where: {
            doctorId,
            appointmentDateTime: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        orderBy: { appointmentDateTime: 'asc' },
    });
};
exports.getTodayAppointments = getTodayAppointments;
const rescheduleAppointment = async (id, newDateTime) => {
    const appointment = await db_1.default.appointment.findUnique({
        where: { id },
    });
    if (!appointment) {
        throw new errors_1.NotFoundError('Appointment not found');
    }
    const newDate = new Date(newDateTime);
    if (newDate < new Date()) {
        throw new errors_1.BadRequestError('Cannot reschedule appointments to the past');
    }
    // Check overlap (excluding this appointment itself)
    const conflict = await db_1.default.appointment.findFirst({
        where: {
            doctorId: appointment.doctorId,
            appointmentDateTime: newDate,
            status: {
                not: client_1.AppointmentStatus.CANCELLED,
            },
            id: {
                not: id,
            },
        },
    });
    if (conflict) {
        throw new errors_1.BadRequestError('Doctor is already booked for this time slot');
    }
    const durationMinutes = 30;
    const endDateTime = new Date(newDate.getTime() + durationMinutes * 60 * 1000);
    const updated = await db_1.default.appointment.update({
        where: { id },
        data: {
            appointmentDateTime: newDate,
            endDateTime,
            status: client_1.AppointmentStatus.RESCHEDULED,
        },
    });
    // Notify
    const patient = await db_1.default.patient.findUnique({ where: { id: appointment.patientId } });
    const doctor = await db_1.default.doctor.findUnique({ where: { id: appointment.doctorId } });
    if (patient) {
        await (0, notification_service_1.createNotification)(patient.userId, `Your appointment with Dr. ${updated.doctorName} has been rescheduled to ${newDate.toLocaleString()}`, 'APPOINTMENT');
    }
    if (doctor) {
        await (0, notification_service_1.createNotification)(doctor.userId, `Appointment rescheduled: Patient ${updated.patientName} on ${newDate.toLocaleString()}`, 'APPOINTMENT');
    }
    return updated;
};
exports.rescheduleAppointment = rescheduleAppointment;
const cancelAppointment = async (id, reason) => {
    const appointment = await db_1.default.appointment.findUnique({
        where: { id },
    });
    if (!appointment) {
        throw new errors_1.NotFoundError('Appointment not found');
    }
    const updated = await db_1.default.appointment.update({
        where: { id },
        data: {
            status: client_1.AppointmentStatus.CANCELLED,
            cancellationReason: reason || null,
        },
    });
    // Notify
    const patient = await db_1.default.patient.findUnique({ where: { id: appointment.patientId } });
    const doctor = await db_1.default.doctor.findUnique({ where: { id: appointment.doctorId } });
    if (patient) {
        await (0, notification_service_1.createNotification)(patient.userId, `Your appointment with Dr. ${updated.doctorName} on ${updated.appointmentDateTime.toLocaleString()} has been CANCELLED.`, 'APPOINTMENT');
    }
    if (doctor) {
        await (0, notification_service_1.createNotification)(doctor.userId, `Appointment CANCELLED: Patient ${updated.patientName} on ${updated.appointmentDateTime.toLocaleString()}`, 'APPOINTMENT');
    }
    return updated;
};
exports.cancelAppointment = cancelAppointment;
const completeAppointment = async (id, notes) => {
    const appointment = await db_1.default.appointment.findUnique({
        where: { id },
    });
    if (!appointment) {
        throw new errors_1.NotFoundError('Appointment not found');
    }
    const updated = await db_1.default.appointment.update({
        where: { id },
        data: {
            status: client_1.AppointmentStatus.COMPLETED,
            consultationNotes: notes || null,
        },
    });
    // Auto-generate invoice when appointment is completed!
    const doctor = await db_1.default.doctor.findUnique({ where: { id: appointment.doctorId } });
    const fee = doctor?.consultationFee || 100.0; // Default consultation fee if not specified
    await db_1.default.invoice.create({
        data: {
            patientId: appointment.patientId,
            patientName: appointment.patientName,
            patientEmail: appointment.patientEmail,
            appointmentId: id,
            totalAmount: fee,
            discount: 0,
            tax: 0,
            finalAmount: fee,
            status: 'PENDING',
            description: `Consultation fee for Dr. ${appointment.doctorName}`,
        },
    });
    // Notify
    const patient = await db_1.default.patient.findUnique({ where: { id: appointment.patientId } });
    if (patient) {
        await (0, notification_service_1.createNotification)(patient.userId, `Your consultation with Dr. ${updated.doctorName} is complete. An invoice has been generated.`, 'APPOINTMENT');
    }
    return updated;
};
exports.completeAppointment = completeAppointment;
const confirmAppointment = async (id) => {
    const appointment = await db_1.default.appointment.findUnique({
        where: { id },
    });
    if (!appointment) {
        throw new errors_1.NotFoundError('Appointment not found');
    }
    const updated = await db_1.default.appointment.update({
        where: { id },
        data: {
            status: client_1.AppointmentStatus.CONFIRMED,
        },
    });
    // Notify
    const patient = await db_1.default.patient.findUnique({ where: { id: appointment.patientId } });
    if (patient) {
        await (0, notification_service_1.createNotification)(patient.userId, `Your appointment with Dr. ${updated.doctorName} has been CONFIRMED.`, 'APPOINTMENT');
    }
    return updated;
};
exports.confirmAppointment = confirmAppointment;
