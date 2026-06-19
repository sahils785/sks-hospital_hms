import { Request, Response, NextFunction } from 'express';
import * as documentService from '../services/document.service';
import * as supabaseService from '../services/supabase.service';
import { BadRequestError } from '../utils/errors';

export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new BadRequestError('No file provided in the request');
    }

    const { entityType, entityId } = req.body;
    if (!entityType || !entityId) {
      throw new BadRequestError('Request parameters must include "entityType" and "entityId"');
    }

    const bucket = entityType.toLowerCase() === 'patient' ? 'patients' : 'documents';

    // Upload to Supabase Storage
    const fileUrl = await supabaseService.uploadFile(
      bucket,
      req.file.originalname,
      req.file.buffer,
      req.file.mimetype
    );

    // Save to Database
    const result = await documentService.createDocumentRecord({
      fileName: req.file.originalname,
      fileUrl,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      entityType,
      entityId: parseInt(entityId, 10),
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { entityType, entityId } = req.params;
    const result = await documentService.getDocumentsByEntity(
      entityType,
      parseInt(entityId, 10)
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    await documentService.deleteDocument(id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
