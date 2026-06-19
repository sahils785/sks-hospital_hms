"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const fs_1 = __importDefault(require("fs"));
// Routers
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const patient_routes_1 = __importDefault(require("./routes/patient.routes"));
const doctor_routes_1 = __importDefault(require("./routes/doctor.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const prescription_routes_1 = __importDefault(require("./routes/prescription.routes"));
const billing_routes_1 = __importDefault(require("./routes/billing.routes"));
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
// Middleware
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
// Security configurations
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Logging
app.use((0, morgan_1.default)('dev'));
// Body parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Rate Limiter: Max 100 requests per 15 minutes
const limiter = (0, express_rate_limit_1.default)({
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
const swaggerPath = path_1.default.join(__dirname, 'docs', 'swagger.json');
if (fs_1.default.existsSync(swaggerPath)) {
    const swaggerDocument = JSON.parse(fs_1.default.readFileSync(swaggerPath, 'utf8'));
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
    app.use('/swagger-ui.html', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
}
// API Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/patients', patient_routes_1.default);
app.use('/api/v1/doctors', doctor_routes_1.default);
app.use('/api/v1/appointments', appointment_routes_1.default);
app.use('/api/v1/prescriptions', prescription_routes_1.default);
app.use('/api/v1/billing', billing_routes_1.default);
app.use('/api/v1/documents', document_routes_1.default);
app.use('/api/v1/analytics', analytics_routes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});
// Centralized error handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
