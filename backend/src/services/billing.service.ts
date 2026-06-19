import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { createNotification } from './notification.service';
import { InvoiceStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export const createInvoice = async (data: {
  patientId: number;
  appointmentId?: number;
  totalAmount: number | string | Decimal;
  discount?: number | string | Decimal;
  tax?: number | string | Decimal;
  description?: string;
}) => {
  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId },
  });
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  const discount = new Decimal(data.discount || 0);
  const tax = new Decimal(data.tax || 0);
  const total = new Decimal(data.totalAmount);
  const final = total.minus(discount).plus(tax);

  return await prisma.invoice.create({
    data: {
      patientId: data.patientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientEmail: patient.email,
      appointmentId: data.appointmentId || null,
      totalAmount: total,
      discount,
      tax,
      finalAmount: final,
      status: InvoiceStatus.PENDING,
      description: data.description || null,
    },
  });
};

export const processPayment = async (data: {
  invoiceId: number;
  amount: number | string | Decimal;
  paymentMethod: PaymentMethod;
  transactionId?: string;
}) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: data.invoiceId },
    include: { payments: true },
  });
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  if (invoice.status === InvoiceStatus.PAID) {
    throw new BadRequestError('Invoice is already fully paid');
  }

  const paymentAmount = new Decimal(data.amount);

  return await prisma.$transaction(async (tx) => {
    // Save payment log
    const payment = await tx.payment.create({
      data: {
        invoiceId: data.invoiceId,
        amount: paymentAmount,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId || null,
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
      },
    });

    // Compute total paid amount on this invoice
    const allPayments = await tx.payment.findMany({
      where: {
        invoiceId: data.invoiceId,
        status: PaymentStatus.SUCCESS,
      },
    });

    const totalPaid = allPayments.reduce(
      (sum, p) => sum.plus(new Decimal(p.amount)),
      new Decimal(0)
    );

    let nextStatus: InvoiceStatus = InvoiceStatus.PENDING;
    if (totalPaid.greaterThanOrEqualTo(new Decimal(invoice.finalAmount))) {
      nextStatus = InvoiceStatus.PAID;
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
      await createNotification(
        patientProfile.userId,
        `Payment of $${paymentAmount.toString()} received successfully for invoice #${invoice.id}. Invoice status: ${nextStatus}.`,
        'BILLING'
      );
    }

    return updatedInvoice;
  });
};

export const getInvoiceById = async (id: number) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { payments: true },
  });
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }
  return invoice;
};

export const getAllInvoices = async (
  page: number = 0,
  size: number = 20,
  status?: string
) => {
  const skip = page * size;
  const take = size;

  const where: any = {};
  if (status) {
    where.status = status.toUpperCase() as InvoiceStatus;
  }

  const [content, totalElements] = await prisma.$transaction([
    prisma.invoice.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { payments: true },
    }),
    prisma.invoice.count({ where }),
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

export const getPatientInvoices = async (
  patientId: number,
  page: number = 0,
  size: number = 20
) => {
  const skip = page * size;
  const take = size;

  const [content, totalElements] = await prisma.$transaction([
    prisma.invoice.findMany({
      where: { patientId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { payments: true },
    }),
    prisma.invoice.count({ where: { patientId } }),
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
