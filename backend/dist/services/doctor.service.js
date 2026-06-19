"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDepartments = exports.getAllSpecializations = exports.getAvailability = exports.updateDoctor = exports.getAllDoctors = exports.getDoctorByUserId = exports.getDoctorById = exports.createDoctor = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const library_1 = require("@prisma/client/runtime/library");
const createDoctor = async (data) => {
    const existingUser = await db_1.default.doctor.findUnique({
        where: { userId: data.userId },
    });
    if (existingUser) {
        throw new errors_1.BadRequestError('Doctor profile already exists for this user');
    }
    const existingLicense = await db_1.default.doctor.findUnique({
        where: { licenseNumber: data.licenseNumber },
    });
    if (existingLicense) {
        throw new errors_1.BadRequestError('License number is already registered');
    }
    return await db_1.default.$transaction(async (tx) => {
        const doctor = await tx.doctor.create({
            data: {
                userId: data.userId,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone || null,
                specialization: data.specialization,
                licenseNumber: data.licenseNumber,
                qualification: data.qualification || null,
                experienceYears: data.experienceYears || null,
                consultationFee: data.consultationFee ? new library_1.Decimal(data.consultationFee) : null,
                department: data.department || null,
                bio: data.bio || null,
                available: true,
            },
        });
        if (data.schedules && data.schedules.length > 0) {
            await tx.doctorSchedule.createMany({
                data: data.schedules.map((s) => ({
                    doctorId: doctor.id,
                    dayOfWeek: s.dayOfWeek.toUpperCase(),
                    startTime: s.startTime,
                    endTime: s.endTime,
                    slotDurationMinutes: s.slotDurationMinutes || 30,
                    maxPatients: s.maxPatients || 20,
                    active: true,
                })),
            });
        }
        return await tx.doctor.findUnique({
            where: { id: doctor.id },
            include: { schedules: true },
        });
    });
};
exports.createDoctor = createDoctor;
const getDoctorById = async (id) => {
    const doctor = await db_1.default.doctor.findUnique({
        where: { id },
        include: { schedules: true },
    });
    if (!doctor) {
        throw new errors_1.NotFoundError('Doctor not found');
    }
    return doctor;
};
exports.getDoctorById = getDoctorById;
const getDoctorByUserId = async (userId) => {
    const doctor = await db_1.default.doctor.findUnique({
        where: { userId },
        include: { schedules: true },
    });
    if (!doctor) {
        throw new errors_1.NotFoundError('Doctor profile not found for this user ID');
    }
    return doctor;
};
exports.getDoctorByUserId = getDoctorByUserId;
const getAllDoctors = async (page = 0, size = 20, search, sortBy = 'firstName') => {
    const skip = page * size;
    const take = size;
    const where = { available: true };
    if (search && search.trim() !== '') {
        where.OR = [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { specialization: { contains: search, mode: 'insensitive' } },
            { department: { contains: search, mode: 'insensitive' } },
        ];
    }
    const validSortFields = ['firstName', 'lastName', 'specialization', 'department', 'createdAt'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'firstName';
    const [content, totalElements] = await db_1.default.$transaction([
        db_1.default.doctor.findMany({
            where,
            skip,
            take,
            orderBy: { [actualSortBy]: 'asc' },
            include: { schedules: true },
        }),
        db_1.default.doctor.count({ where }),
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
exports.getAllDoctors = getAllDoctors;
const updateDoctor = async (id, data) => {
    const doctor = await db_1.default.doctor.findUnique({ where: { id } });
    if (!doctor) {
        throw new errors_1.NotFoundError('Doctor not found');
    }
    return await db_1.default.$transaction(async (tx) => {
        const updatedDoctor = await tx.doctor.update({
            where: { id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                specialization: data.specialization,
                qualification: data.qualification,
                experienceYears: data.experienceYears,
                consultationFee: data.consultationFee ? new library_1.Decimal(data.consultationFee) : undefined,
                department: data.department,
                bio: data.bio,
                available: data.available,
            },
        });
        if (data.schedules) {
            // Re-create schedules (delete old ones and create new ones)
            await tx.doctorSchedule.deleteMany({ where: { doctorId: id } });
            if (data.schedules.length > 0) {
                await tx.doctorSchedule.createMany({
                    data: data.schedules.map((s) => ({
                        doctorId: id,
                        dayOfWeek: s.dayOfWeek.toUpperCase(),
                        startTime: s.startTime,
                        endTime: s.endTime,
                        slotDurationMinutes: s.slotDurationMinutes || 30,
                        maxPatients: s.maxPatients || 20,
                        active: s.active !== undefined ? s.active : true,
                    })),
                });
            }
        }
        return await tx.doctor.findUnique({
            where: { id },
            include: { schedules: true },
        });
    });
};
exports.updateDoctor = updateDoctor;
const getAvailability = async (id, dateStr) => {
    const doctor = await db_1.default.doctor.findUnique({
        where: { id },
        include: { schedules: true },
    });
    if (!doctor) {
        throw new errors_1.NotFoundError('Doctor not found');
    }
    const queryDate = new Date(dateStr);
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayOfWeek = dayNames[queryDate.getDay()];
    // Fetch doctor schedules matching day of week
    const daySchedules = doctor.schedules.filter((s) => s.dayOfWeek === dayOfWeek && s.active);
    // Fetch booked appointments on this date for this doctor (excluding CANCELLED)
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
    const appointments = await db_1.default.appointment.findMany({
        where: {
            doctorId: id,
            appointmentDateTime: {
                gte: startOfDay,
                lte: endOfDay,
            },
            status: {
                not: 'CANCELLED',
            },
        },
        select: {
            appointmentDateTime: true,
        },
    });
    const bookedTimes = appointments.map((apt) => {
        const aptTime = new Date(apt.appointmentDateTime);
        const hours = String(aptTime.getHours()).padStart(2, '0');
        const mins = String(aptTime.getMinutes()).padStart(2, '0');
        return `${hours}:${mins}`;
    });
    const slots = [];
    for (const schedule of daySchedules) {
        const [sHour, sMin] = schedule.startTime.split(':').map(Number);
        const [eHour, eMin] = schedule.endTime.split(':').map(Number);
        const slotDuration = schedule.slotDurationMinutes;
        let currentMinutes = sHour * 60 + sMin;
        const endMinutes = eHour * 60 + eMin;
        while (currentMinutes + slotDuration <= endMinutes) {
            const curHour = Math.floor(currentMinutes / 60);
            const curMin = currentMinutes % 60;
            const startStr = `${String(curHour).padStart(2, '0')}:${String(curMin).padStart(2, '0')}`;
            const nextMinutes = currentMinutes + slotDuration;
            const nextHour = Math.floor(nextMinutes / 60);
            const nextMin = nextMinutes % 60;
            const endStr = `${String(nextHour).padStart(2, '0')}:${String(nextMin).padStart(2, '0')}`;
            const isBooked = bookedTimes.includes(startStr);
            slots.push({
                startTime: startStr,
                endTime: endStr,
                available: !isBooked,
            });
            currentMinutes += slotDuration;
        }
    }
    return {
        doctorId: id,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        specialization: doctor.specialization,
        date: dateStr,
        availableSlots: slots,
    };
};
exports.getAvailability = getAvailability;
const getAllSpecializations = async () => {
    const result = await db_1.default.doctor.findMany({
        select: { specialization: true },
        distinct: ['specialization'],
    });
    return result.map((r) => r.specialization).filter(Boolean);
};
exports.getAllSpecializations = getAllSpecializations;
const getAllDepartments = async () => {
    const result = await db_1.default.doctor.findMany({
        select: { department: true },
        distinct: ['department'],
    });
    return result.map((r) => r.department).filter(Boolean);
};
exports.getAllDepartments = getAllDepartments;
