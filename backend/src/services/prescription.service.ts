import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { createNotification } from './notification.service';

const mapPrescriptionResponse = (prescription: any) => {
  if (!prescription) return null;
  const medicines = (prescription.medications || []).map((m: any) => ({
    name: m.medicineName,
    dosage: m.dosage || '',
    frequency: m.frequency || '',
    duration: m.duration || '',
    instructions: m.instructions || ''
  }));
  return {
    ...prescription,
    medicines
  };
};

const resolvePatientIdByName = async (patientName: string): Promise<number> => {
  const parts = patientName.trim().split(/\s+/);
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
    return found.id;
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
    return newPatient.id;
  }
};

const resolveDoctorIdByName = async (doctorName: string): Promise<number> => {
  const cleanName = doctorName.replace(/^(dr\.?\s*)/i, '').trim();
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
    return found.id;
  } else {
    const fallback = await prisma.doctor.findFirst();
    if (fallback) {
      return fallback.id;
    } else {
      throw new NotFoundError('No doctors registered in the system');
    }
  }
};

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
    patientId = await resolvePatientIdByName(data.patientName);
  }

  if (!doctorId && data.doctorName) {
    doctorId = await resolveDoctorIdByName(data.doctorName);
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

  return mapPrescriptionResponse(prescription);
};

export const updatePrescription = async (
  id: number,
  data: {
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
  }
) => {
  const existing = await prisma.prescription.findUnique({
    where: { id },
  });
  if (!existing) {
    throw new NotFoundError('Prescription not found');
  }

  let patientId = data.patientId || existing.patientId;
  let doctorId = data.doctorId || existing.doctorId;

  if (data.patientName && data.patientName !== existing.patientName) {
    patientId = await resolvePatientIdByName(data.patientName);
  }

  if (data.doctorName && data.doctorName !== existing.doctorName) {
    doctorId = await resolveDoctorIdByName(data.doctorName);
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

  const updated = await prisma.$transaction(async (tx) => {
    // Delete existing medications
    await tx.medication.deleteMany({
      where: { prescriptionId: id },
    });

    // Update prescription
    const updatedPres = await tx.prescription.update({
      where: { id },
      data: {
        patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorId,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        appointmentId: data.appointmentId !== undefined ? data.appointmentId : existing.appointmentId,
        diagnosis: data.diagnosis !== undefined ? data.diagnosis : existing.diagnosis,
        notes: data.notes !== undefined ? data.notes : existing.notes,
      },
    });

    // Create new medications
    if (rawMedications.length > 0) {
      await tx.medication.createMany({
        data: rawMedications.map((m) => ({
          prescriptionId: id,
          medicineName: m.medicineName,
          dosage: m.dosage || null,
          frequency: m.frequency || null,
          duration: m.duration || null,
          instructions: m.instructions || null,
        })),
      });
    }

    return await tx.prescription.findUnique({
      where: { id },
      include: { medications: true },
    });
  });

  return mapPrescriptionResponse(updated);
};

export const getPrescriptionById = async (id: number) => {
  const prescription = await prisma.prescription.findUnique({
    where: { id },
    include: { medications: true },
  });
  if (!prescription) {
    throw new NotFoundError('Prescription not found');
  }
  return mapPrescriptionResponse(prescription);
};

export const getPrescriptionByAppointmentId = async (appointmentId: number) => {
  const prescription = await prisma.prescription.findUnique({
    where: { appointmentId },
    include: { medications: true },
  });
  if (!prescription) {
    throw new NotFoundError('No prescription found for this appointment');
  }
  return mapPrescriptionResponse(prescription);
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
    content: content.map(mapPrescriptionResponse),
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
    content: content.map(mapPrescriptionResponse),
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
    content: content.map(mapPrescriptionResponse),
    page,
    size,
    totalElements,
    totalPages,
    first: page === 0,
    last: page >= totalPages - 1,
  };
};
