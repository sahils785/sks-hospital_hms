"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
// Load environment variables
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const notification_service_1 = require("./services/notification.service");
const PORT = process.env.PORT || 8080;
const server = http_1.default.createServer(app_1.default);
// Initialize Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
    },
});
// Bind Socket.IO with the notification broadcast service
(0, notification_service_1.setSocketInstance)(io);
io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    // Listen for user join event to group sockets into private rooms
    socket.on('join', (userId) => {
        if (userId) {
            const room = `user_${userId}`;
            socket.join(room);
            console.log(`[Socket] User ${userId} joined room ${room}`);
        }
    });
    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});
server.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🏥 HMS SaaS Backend listening on Port ${PORT}`);
    console.log(`⚡ Swagger UI: http://localhost:${PORT}/swagger-ui.html`);
    console.log(`⚡ API Gateway: http://localhost:${PORT}/api/v1`);
    console.log(`========================================`);
});
