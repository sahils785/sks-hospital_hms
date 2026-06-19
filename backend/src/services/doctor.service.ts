import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { Decimal } from '@prisma/client/runtime/library';

export const createDoctor = async (data: {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization: string;
  licenseNumber: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: number | string | Decimal;
  department?: string;
  bio?: string;
  schedules?: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes?: number;
    maxPatients?: number;
  }>;
}) => {
  const existingUser = await prisma.doctor.findUnique({
    where: { userId: data.userId },
  });
  if (existingUser) {
    throw new BadRequestError('Doctor profile already exists for this user');
  }

  const existingLicense = await prisma.doctor.findUnique({
    where: { licenseNumber: data.licenseNumber },
  });
  if (existingLicense) {
    throw new BadRequestError('License number is already registered');
  }

  return await prisma.$transaction(async (tx) => {
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
        consultationFee: data.consultationFee ? new Decimal(data.consultationFee) : null,
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

export const getDoctorById = async (id: number) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { schedules: true },
  });
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }
  return doctor;
};

export const getDoctorByUserId = async (userId: number) => {
  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    include: { schedules: true },
  });
  if (!doctor) {
    throw new NotFoundError('Doctor profile not found for this user ID');
  }
  return doctor;
};

export const getAllDoctors = async (
  page: number = 0,
  size: number = 20,
  search?: string,
  sortBy: string = 'firstName'
) => {
  const skip = page * size;
  const take = size;

  const where: any = { available: true };
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

  const [content, totalElements] = await prisma.$transaction([
    prisma.doctor.findMany({
      where,
      skip,
      take,
      orderBy: { [actualSortBy]: 'asc' },
      include: { schedules: true },
    }),
    prisma.doctor.count({ where }),
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

export const updateDoctor = async (
  id: number,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    specialization?: string;
    qualification?: string;
    experienceYears?: number;
    consultationFee?: number | string | Decimal;
    department?: string;
    bio?: string;
    available?: boolean;
    schedules?: Array<{
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      slotDurationMinutes?: number;
      maxPatients?: number;
      active?: boolean;
    }>;
  }
) => {
  const doctor = await prisma.doctor.findUnique({ where: { id } });
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }

  return await prisma.$transaction(async (tx) => {
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
        consultationFee: data.consultationFee ? new Decimal(data.consultationFee) : undefined,
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

export const getAvailability = async (id: number, dateStr: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { schedules: true },
  });
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }

  const queryDate = new Date(dateStr);
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayOfWeek = dayNames[queryDate.getDay()];

  // Fetch doctor schedules matching day of week
  const daySchedules = doctor.schedules.filter(
    (s) => s.dayOfWeek === dayOfWeek && s.active
  );

  // Fetch booked appointments on this date for this doctor (excluding CANCELLED)
  const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

  const appointments = await prisma.appointment.findMany({
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

  const slots: Array<{ startTime: string; endTime: string; available: boolean }> = [];

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

export const getAllSpecializations = async () => {
  const result = await prisma.doctor.findMany({
    select: { specialization: true },
    distinct: ['specialization'],
  });
  return result.map((r) => r.specialization).filter(Boolean);
};

export const getAllDepartments = async () => {
  const result = await prisma.doctor.findMany({
    select: { department: true },
    distinct: ['department'],
  });
  return result.map((r) => r.department).filter(Boolean);
};
