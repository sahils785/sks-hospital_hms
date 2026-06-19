import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

import app from './app';
import { setSocketInstance } from './services/notification.service';

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

// Bind Socket.IO with the notification broadcast service
setSocketInstance(io);

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Listen for user join event to group sockets into private rooms
  socket.on('join', (userId: number) => {
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
