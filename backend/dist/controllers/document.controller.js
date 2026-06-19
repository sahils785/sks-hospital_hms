"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.getDocuments = exports.uploadDocument = void 0;
const documentService = __importStar(require("../services/document.service"));
const supabaseService = __importStar(require("../services/supabase.service"));
const errors_1 = require("../utils/errors");
const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new errors_1.BadRequestError('No file provided in the request');
        }
        const { entityType, entityId } = req.body;
        if (!entityType || !entityId) {
            throw new errors_1.BadRequestError('Request parameters must include "entityType" and "entityId"');
        }
        const bucket = entityType.toLowerCase() === 'patient' ? 'patients' : 'documents';
        // Upload to Supabase Storage
        const fileUrl = await supabaseService.uploadFile(bucket, req.file.originalname, req.file.buffer, req.file.mimetype);
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
    }
    catch (error) {
        next(error);
    }
};
exports.uploadDocument = uploadDocument;
const getDocuments = async (req, res, next) => {
    try {
        const { entityType, entityId } = req.params;
        const result = await documentService.getDocumentsByEntity(entityType, parseInt(entityId, 10));
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDocuments = getDocuments;
const deleteDocument = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        await documentService.deleteDocument(id);
        res.status(200).json({
            success: true,
            message: 'Document deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDocument = deleteDocument;
