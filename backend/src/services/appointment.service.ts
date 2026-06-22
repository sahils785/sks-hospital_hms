import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { createNotification } from './notification.service';
import { AppointmentStatus } from '@prisma/client';

export const bookAppointment = async (data: {
  patientId?: number;
  patientName?: string;
  doctorId?: number;
  doctorName?: string;
  appointmentDateTime: Date | string;
  reason?: string;
}) => {
  let patientId = data.patientId;
  let doctorId = data.doctorId;

  if (!patientId && data.patientName) {
    const parts = data.patientName.trim().split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    let found = await prisma.patient.findFirst({
      where: {
        firstName: { equals: firstName, mode: 'insensitive' },
        lastName: { equals: lastName, mode: 'insensitive' }
      }
    });
    if (!found) {
      found = await prisma.patient.findFirst({
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
    } else {
      const email = `${firstName.toLowerCase()}.${(lastName || 'patient').toLowerCase()}@hospital.com`;
      const uniqueUsername = `${firstName.toLowerCase()}_${(lastName || 'patient').toLowerCase()}_${Date.now().toString().slice(-4)}`;
      const user = await prisma.user.create({
        data: {
          username: uniqueUsername,
          email,
          passwordHash: '$2b$10$tJ24.XnL4hM2z.b2i0Wk7uqB.n/5fF78n.lSveO1Y.B.m2f.Z2C5m', // Patient@123
          firstName,
          lastName: lastName || 'Patient',
          roles: ['PATIENT']
        }
      });
      const newPatient = await prisma.patient.create({
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
    let found = await prisma.doctor.findFirst({
      where: {
        firstName: { equals: firstName, mode: 'insensitive' },
        lastName: { equals: lastName, mode: 'insensitive' }
      }
    });
    if (!found) {
      found = await prisma.doctor.findFirst({
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
    } else {
      const fallback = await prisma.doctor.findFirst();
      if (fallback) {
        doctorId = fallback.id;
      } else {
        throw new NotFoundError('No doctors registered in the system');
      }
    }
  }

  if (!patientId) {
    throw new BadRequestError('Patient ID or Patient Name is required');
  }
  if (!doctorId) {
    throw new BadRequestError('Doctor ID or Doctor Name is required');
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { user: true },
  });
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { user: true, schedules: true },
  });
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }

  const aptDate = new Date(data.appointmentDateTime);

  // Validate doctor availability (simple validation: ensure date is not in past, and slot doesn't conflict)
  if (aptDate < new Date()) {
    throw new BadRequestError('Cannot book appointments in the past');
  }

  // Check overlap
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId: doctorId,
      appointmentDateTime: aptDate,
      status: {
        not: AppointmentStatus.CANCELLED,
      },
    },
  });

  if (conflict) {
    throw new BadRequestError('Doctor is already booked for this time slot');
  }

  const durationMinutes = 30; // default duration
  const endDateTime = new Date(aptDate.getTime() + durationMinutes * 60 * 1000);

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientEmail: patient.email,
      doctorId: doctorId,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      appointmentDateTime: aptDate,
      endDateTime,
      status: AppointmentStatus.SCHEDULED,
      reason: data.reason || null,
    },
  });

  // Create notifications
  await createNotification(
    patient.userId,
    `Your appointment with Dr. ${doctor.lastName} is booked for ${aptDate.toLocaleString()}`,
    'APPOINTMENT'
  );
  await createNotification(
    doctor.userId,
    `New appointment booked: ${patient.firstName} ${patient.lastName} on ${aptDate.toLocaleString()}`,
    'APPOINTMENT'
  );

  return appointment;
};

export const getAppointmentById = async (id: number) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }
  return appointment;
};

export const getAllAppointments = async (
  page: number = 0,
  size: number = 20,
  status?: string
) => {
  const skip = page * size;
  const take = size;

  const where: any = {};
  if (status) {
    where.status = status.toUpperCase() as AppointmentStatus;
  }

  const [content, totalElements] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      skip,
      take,
      orderBy: { appointmentDateTime: 'desc' },
    }),
    prisma.appointment.count({ where }),
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

export const getPatientAppointments = async (
  patientId: number,
  page: number = 0,
  size: number = 20
) => {
  const skip = page * size;
  const take = size;

  const [content, totalElements] = await prisma.$transaction([
    prisma.appointment.findMany({
      where: { patientId },
      skip,
      take,
      orderBy: { appointmentDateTime: 'desc' },
    }),
    prisma.appointment.count({ where: { patientId } }),
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

export const getDoctorAppointments = async (
  doctorId: number,
  page: number = 0,
  size: number = 20
) => {
  const skip = page * size;
  const take = size;

  const [content, totalElements] = await prisma.$transaction([
    prisma.appointment.findMany({
      where: { doctorId },
      skip,
      take,
      orderBy: { appointmentDateTime: 'desc' },
    }),
    prisma.appointment.count({ where: { doctorId } }),
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

export const getTodayAppointments = async (doctorId: number) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return await prisma.appointment.findMany({
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

export const rescheduleAppointment = async (id: number, newDateTime: Date | string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  const newDate = new Date(newDateTime);
  if (newDate < new Date()) {
    throw new BadRequestError('Cannot reschedule appointments to the past');
  }

  // Check overlap (excluding this appointment itself)
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId: appointment.doctorId,
      appointmentDateTime: newDate,
      status: {
        not: AppointmentStatus.CANCELLED,
      },
      id: {
        not: id,
      },
    },
  });

  if (conflict) {
    throw new BadRequestError('Doctor is already booked for this time slot');
  }

  const durationMinutes = 30;
  const endDateTime = new Date(newDate.getTime() + durationMinutes * 60 * 1000);

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      appointmentDateTime: newDate,
      endDateTime,
      status: AppointmentStatus.RESCHEDULED,
    },
  });

  // Notify
  const patient = await prisma.patient.findUnique({ where: { id: appointment.patientId } });
  const doctor = await prisma.doctor.findUnique({ where: { id: appointment.doctorId } });

  if (patient) {
    await createNotification(
      patient.userId,
      `Your appointment with Dr. ${updated.doctorName} has been rescheduled to ${newDate.toLocaleString()}`,
      'APPOINTMENT'
    );
  }
  if (doctor) {
    await createNotification(
      doctor.userId,
      `Appointment rescheduled: Patient ${updated.patientName} on ${newDate.toLocaleString()}`,
      'APPOINTMENT'
    );
  }

  return updated;
};

export const cancelAppointment = async (id: number, reason?: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: AppointmentStatus.CANCELLED,
      cancellationReason: reason || null,
    },
  });

  // Notify
  const patient = await prisma.patient.findUnique({ where: { id: appointment.patientId } });
  const doctor = await prisma.doctor.findUnique({ where: { id: appointment.doctorId } });

  if (patient) {
    await createNotification(
      patient.userId,
      `Your appointment with Dr. ${updated.doctorName} on ${updated.appointmentDateTime.toLocaleString()} has been CANCELLED.`,
      'APPOINTMENT'
    );
  }
  if (doctor) {
    await createNotification(
      doctor.userId,
      `Appointment CANCELLED: Patient ${updated.patientName} on ${updated.appointmentDateTime.toLocaleString()}`,
      'APPOINTMENT'
    );
  }

  return updated;
};

export const completeAppointment = async (id: number, notes?: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: AppointmentStatus.COMPLETED,
      consultationNotes: notes || null,
    },
  });

  // Auto-generate invoice when appointment is completed!
  const doctor = await prisma.doctor.findUnique({ where: { id: appointment.doctorId } });
  const fee = doctor?.consultationFee || 100.0; // Default consultation fee if not specified

  await prisma.invoice.create({
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
  const patient = await prisma.patient.findUnique({ where: { id: appointment.patientId } });
  if (patient) {
    await createNotification(
      patient.userId,
      `Your consultation with Dr. ${updated.doctorName} is complete. An invoice has been generated.`,
      'APPOINTMENT'
    );
  }

  return updated;
};

export const confirmAppointment = async (id: number) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: AppointmentStatus.CONFIRMED,
    },
  });

  // Notify
  const patient = await prisma.patient.findUnique({ where: { id: appointment.patientId } });
  if (patient) {
    await createNotification(
      patient.userId,
      `Your appointment with Dr. ${updated.doctorName} has been CONFIRMED.`,
      'APPOINTMENT'
    );
  }

  return updated;
};
