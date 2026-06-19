"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientInvoices = exports.getAllInvoices = exports.getInvoiceById = exports.processPayment = exports.createInvoice = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const notification_service_1 = require("./notification.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const createInvoice = async (data) => {
    const patient = await db_1.default.patient.findUnique({
        where: { id: data.patientId },
    });
    if (!patient) {
        throw new errors_1.NotFoundError('Patient not found');
    }
    const discount = new library_1.Decimal(data.discount || 0);
    const tax = new library_1.Decimal(data.tax || 0);
    const total = new library_1.Decimal(data.totalAmount);
    const final = total.minus(discount).plus(tax);
    return await db_1.default.invoice.create({
        data: {
            patientId: data.patientId,
            patientName: `${patient.firstName} ${patient.lastName}`,
            patientEmail: patient.email,
            appointmentId: data.appointmentId || null,
            totalAmount: total,
            discount,
            tax,
            finalAmount: final,
            status: client_1.InvoiceStatus.PENDING,
            description: data.description || null,
        },
    });
};
exports.createInvoice = createInvoice;
const processPayment = async (data) => {
    const invoice = await db_1.default.invoice.findUnique({
        where: { id: data.invoiceId },
        include: { payments: true },
    });
    if (!invoice) {
        throw new errors_1.NotFoundError('Invoice not found');
    }
    if (invoice.status === client_1.InvoiceStatus.PAID) {
        throw new errors_1.BadRequestError('Invoice is already fully paid');
    }
    const paymentAmount = new library_1.Decimal(data.amount);
    return await db_1.default.$transaction(async (tx) => {
        // Save payment log
        const payment = await tx.payment.create({
            data: {
                invoiceId: data.invoiceId,
                amount: paymentAmount,
                paymentMethod: data.paymentMethod,
                transactionId: data.transactionId || null,
                status: client_1.PaymentStatus.SUCCESS,
                paidAt: new Date(),
            },
        });
        // Compute total paid amount on this invoice
        const allPayments = await tx.payment.findMany({
            where: {
                invoiceId: data.invoiceId,
                status: client_1.PaymentStatus.SUCCESS,
            },
        });
        const totalPaid = allPayments.reduce((sum, p) => sum.plus(new library_1.Decimal(p.amount)), new library_1.Decimal(0));
        let nextStatus = client_1.InvoiceStatus.PENDING;
        if (totalPaid.greaterThanOrEqualTo(new library_1.Decimal(invoice.finalAmount))) {
            nextStatus = client_1.InvoiceStatus.PAID;
        }
        const updatedInvoice = await tx.invoice.update({
            where: { id: data.invoiceId },
            data: { status: nextStatus },
            include: { payments: true },
        });
        // Notify patient
        const patientProfile = await tx.patient.findUnique({
            where: { id: invoice.patientId },
        });
        if (patientProfile) {
            await (0, notification_service_1.createNotification)(patientProfile.userId, `Payment of $${paymentAmount.toString()} received successfully for invoice #${invoice.id}. Invoice status: ${nextStatus}.`, 'BILLING');
        }
        return updatedInvoice;
    });
};
exports.processPayment = processPayment;
const getInvoiceById = async (id) => {
    const invoice = await db_1.default.invoice.findUnique({
        where: { id },
        include: { payments: true },
    });
    if (!invoice) {
        throw new errors_1.NotFoundError('Invoice not found');
    }
    return invoice;
};
exports.getInvoiceById = getInvoiceById;
const getAllInvoices = async (page = 0, size = 20, status) => {
    const skip = page * size;
    const take = size;
    const where = {};
    if (status) {
        where.status = status.toUpperCase();
    }
    const [content, totalElements] = await db_1.default.$transaction([
        db_1.default.invoice.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: { payments: true },
        }),
        db_1.default.invoice.count({ where }),
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
exports.getAllInvoices = getAllInvoices;
const getPatientInvoices = async (patientId, page = 0, size = 20) => {
    const skip = page * size;
    const take = size;
    const [content, totalElements] = await db_1.default.$transaction([
        db_1.default.invoice.findMany({
            where: { patientId },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: { payments: true },
        }),
        db_1.default.invoice.count({ where: { patientId } }),
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
exports.getPatientInvoices = getPatientInvoices;
