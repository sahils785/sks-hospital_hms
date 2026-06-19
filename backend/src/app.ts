import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

// Routers
import authRouter from './routes/auth.routes';
import patientRouter from './routes/patient.routes';
import doctorRouter from './routes/doctor.routes';
import appointmentRouter from './routes/appointment.routes';
import prescriptionRouter from './routes/prescription.routes';
import billingRouter from './routes/billing.routes';
import documentRouter from './routes/document.routes';
import analyticsRouter from './routes/analytics.routes';

// Middleware
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security configurations
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter: Max 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Serve Static Swagger Documents
const swaggerPath = path.join(__dirname, 'docs', 'swagger.json');
if (fs.existsSync(swaggerPath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/swagger-ui.html', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/patients', patientRouter);
app.use('/api/v1/doctors', doctorRouter);
app.use('/api/v1/appointments', appointmentRouter);
app.use('/api/v1/prescriptions', prescriptionRouter);
app.use('/api/v1/billing', billingRouter);
app.use('/api/v1/documents', documentRouter);
app.use('/api/v1/analytics', analyticsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Centralized error handler
app.use(errorHandler);

export default app;
