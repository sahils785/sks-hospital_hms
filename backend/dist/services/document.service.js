"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.getDocumentsByEntity = exports.createDocumentRecord = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const supabase_service_1 = require("./supabase.service");
const createDocumentRecord = async (data) => {
    return await db_1.default.document.create({
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
exports.createDocumentRecord = createDocumentRecord;
const getDocumentsByEntity = async (entityType, entityId) => {
    return await db_1.default.document.findMany({
        where: {
            entityType: entityType.toUpperCase(),
            entityId,
        },
        orderBy: { createdAt: 'desc' },
    });
};
exports.getDocumentsByEntity = getDocumentsByEntity;
const deleteDocument = async (id) => {
    const document = await db_1.default.document.findUnique({ where: { id } });
    if (!document) {
        throw new errors_1.NotFoundError('Document record not found');
    }
    // Delete from Supabase Storage
    const bucket = document.entityType.toLowerCase() === 'patient' ? 'patients' : 'documents';
    await (0, supabase_service_1.deleteFile)(bucket, document.fileUrl);
    // Delete from DB
    await db_1.default.document.delete({ where: { id } });
};
exports.deleteDocument = deleteDocument;
