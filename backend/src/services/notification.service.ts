import prisma from '../config/db';

// We will hold a reference to the Socket.IO broadcast helper here
let ioInstance: any = null;

export const setSocketInstance = (io: any) => {
  ioInstance = io;
};

export const createNotification = async (userId: number, message: string, type: string) => {
  const notification = await prisma.notification.create({
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

export const getUserNotifications = async (userId: number) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const markAsRead = async (id: number) => {
  return await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId: number) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
