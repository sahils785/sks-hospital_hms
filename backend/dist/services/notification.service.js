"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getUserNotifications = exports.createNotification = exports.setSocketInstance = void 0;
const db_1 = __importDefault(require("../config/db"));
// We will hold a reference to the Socket.IO broadcast helper here
let ioInstance = null;
const setSocketInstance = (io) => {
    ioInstance = io;
};
exports.setSocketInstance = setSocketInstance;
const createNotification = async (userId, message, type) => {
    const notification = await db_1.default.notification.create({
        data: {
            userId,
            message,
            type,
            isRead: false,
        },
    });
    // If Socket.IO is initialized, broadcast to the user's specific room
    if (ioInstance) {
        ioInstance.to(`user_${userId}`).emit('notification', notification);
    }
    return notification;
};
exports.createNotification = createNotification;
const getUserNotifications = async (userId) => {
    return await db_1.default.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
};
exports.getUserNotifications = getUserNotifications;
const markAsRead = async (id) => {
    return await db_1.default.notification.update({
        where: { id },
        data: { isRead: true },
    });
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (userId) => {
    return await db_1.default.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
};
exports.markAllAsRead = markAllAsRead;
