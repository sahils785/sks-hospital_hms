import { Router } from 'express';
import multer from 'multer';
import * as documentController from '../controllers/document.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit to 10MB
  },
});

router.post(
  '/upload',
  authenticate,
  upload.single('file'),
  documentController.uploadDocument
);

router.get(
  '/:entityType/:entityId',
  authenticate,
  documentController.getDocuments
);

router.delete(
  '/:id',
  authenticate,
  documentController.deleteDocument
);

export default router;
