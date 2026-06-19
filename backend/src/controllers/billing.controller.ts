import { Request, Response, NextFunction } from 'express';
import * as billingService from '../services/billing.service';

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await billingService.createInvoice(req.body);
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const processPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await billingService.processPayment(req.body);
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await billingService.getInvoiceById(id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string || '0', 10);
    const size = parseInt(req.query.size as string || '20', 10);
    const status = req.query.status as string;

    const result = await billingService.getAllInvoices(page, size, status);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = parseInt(req.params.patientId, 10);
    const page = parseInt(req.query.page as string || '0', 10);
    const size = parseInt(req.query.size as string || '20', 10);

    const result = await billingService.getPatientInvoices(patientId, page, size);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
