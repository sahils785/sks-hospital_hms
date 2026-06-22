import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { createNotification } from './notification.service';

export const createPrescription = async (data: {
  patientId?: number;
  patientName?: string;
  doctorId?: number;
  doctorName?: string;
  appointmentId?: number;
  diagnosis?: string;
  notes?: string;
  medications?: Array<{
    medicineName: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }>;
  medicines?: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }>;
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
  });
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }

  const rawMedications: any[] = [...(data.medications || [])];
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

  const prescription = await prisma.$transaction(async (tx) => {
    const created = await tx.prescription.create({
      data: {
        patientId: patientId as number,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorId: doctorId as number,
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

export const getAllPrescriptions = async (
  page: number = 0,
  size: number = 20
) => {
  const skip = page * size;
  const take = size;

  const [content, totalElements] = await prisma.$transaction([
    prisma.prescription.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { medications: true },
    }),
    prisma.prescription.count(),
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
