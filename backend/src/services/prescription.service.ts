import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { createNotification } from './notification.service';

export const createPrescription = async (data: {
  patientId: number;
  doctorId: number;
  appointmentId?: number;
  diagnosis?: string;
  notes?: string;
  medications: Array<{
    medicineName: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }>;
}) => {
  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId },
  });
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: data.doctorId },
  });
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }

  const prescription = await prisma.$transaction(async (tx) => {
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
  await createNotification(
    patient.userId,
    `A new prescription has been issued by Dr. ${doctor.lastName} (Diagnosis: ${data.diagnosis || 'General Checkup'})`,
    'PRESCRIPTION'
  );

  return prescription;
};

export const getPrescriptionById = async (id: number) => {
  const prescription = await prisma.prescription.findUnique({
    where: { id },
    include: { medications: true },
  });
  if (!prescription) {
    throw new NotFoundError('Prescription not found');
  }
  return prescription;
};

export const getPrescriptionByAppointmentId = async (appointmentId: number) => {
  const prescription = await prisma.prescription.findUnique({
    where: { appointmentId },
    include: { medications: true },
  });
  if (!prescription) {
    throw new NotFoundError('No prescription found for this appointment');
  }
  return prescription;
};

export const getPatientPrescriptions = async (
  patientId: number,
  page: number = 0,
  size: number = 20
) => {
  const skip = page * size;
  const take = size;

  const [content, totalElements] = await prisma.$transaction([
    prisma.prescription.findMany({
      where: { patientId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { medications: true },
    }),
    prisma.prescription.count({ where: { patientId } }),
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

export const getDoctorPrescriptions = async (
  doctorId: number,
  page: number = 0,
  size: number = 20
) => {
  const skip = page * size;
  const take = size;

  const [content, totalElements] = await prisma.$transaction([
    prisma.prescription.findMany({
      where: { doctorId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { medications: true },
    }),
    prisma.prescription.count({ where: { doctorId } }),
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
