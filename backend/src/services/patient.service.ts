import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { Gender } from '@prisma/client';

export const createPatient = async (data: {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date | string;
  gender?: Gender;
  bloodGroup?: string;
  address?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiry?: Date | string;
  allergies?: string;
}) => {
  // Check if profile already exists for this user
  const existing = await prisma.patient.findUnique({
    where: { userId: data.userId },
  });
  if (existing) {
    throw new BadRequestError('Patient profile already exists for this user');
  }

  return await prisma.patient.create({
    data: {
      userId: data.userId,
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

export const getPatientById = async (id: number) => {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      medicalHistories: true,
      emergencyContacts: true,
    },
  });
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }
  return patient;
};

export const getPatientByUserId = async (userId: number) => {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    include: {
      medicalHistories: true,
      emergencyContacts: true,
    },
  });
  if (!patient) {
    throw new NotFoundError('Patient profile not found for this user ID');
  }
  return patient;
};

export const getAllPatients = async (
  page: number = 0,
  size: number = 20,
  search?: string,
  sortBy: string = 'createdAt'
) => {
  const skip = page * size;
  const take = size;

  // Build filter
  const where: any = {};
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

  const [content, totalElements] = await prisma.$transaction([
    prisma.patient.findMany({
      where,
      skip,
      take,
      orderBy: { [actualSortBy]: 'desc' },
    }),
    prisma.patient.count({ where }),
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

export const updatePatient = async (
  id: number,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: Date | string;
    gender?: Gender;
    bloodGroup?: string;
    address?: string;
    insuranceProvider?: string;
    insurancePolicyNumber?: string;
    insuranceExpiry?: Date | string;
    allergies?: string;
  }
) => {
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  return await prisma.patient.update({
    where: { id },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : patient.dateOfBirth,
      insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : patient.insuranceExpiry,
    },
  });
};

export const addMedicalHistory = async (
  patientId: number,
  data: {
    condition: string;
    diagnosisDate?: Date | string;
    treatment?: string;
    notes?: string;
  }
) => {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  return await prisma.medicalHistory.create({
    data: {
      patientId,
      condition: data.condition,
      diagnosisDate: data.diagnosisDate ? new Date(data.diagnosisDate) : null,
      treatment: data.treatment || null,
      notes: data.notes || null,
    },
  });
};

export const addEmergencyContact = async (
  patientId: number,
  data: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }
) => {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  return await prisma.emergencyContact.create({
    data: {
      patientId,
      name: data.name,
      relationship: data.relationship,
      phone: data.phone,
      email: data.email || null,
    },
  });
};
