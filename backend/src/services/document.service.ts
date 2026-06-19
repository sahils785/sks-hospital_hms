import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { deleteFile } from './supabase.service';

export const createDocumentRecord = async (data: {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  entityType: string;
  entityId: number;
}) => {
  return await prisma.document.create({
    data: {
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      fileSize: data.fileSize,
      entityType: data.entityType.toUpperCase(),
      entityId: data.entityId,
    },
  });
};

export const getDocumentsByEntity = async (entityType: string, entityId: number) => {
  return await prisma.document.findMany({
    where: {
      entityType: entityType.toUpperCase(),
      entityId,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const deleteDocument = async (id: number) => {
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    throw new NotFoundError('Document record not found');
  }

  // Delete from Supabase Storage
  const bucket = document.entityType.toLowerCase() === 'patient' ? 'patients' : 'documents';
  await deleteFile(bucket, document.fileUrl);

  // Delete from DB
  await prisma.document.delete({ where: { id } });
};
