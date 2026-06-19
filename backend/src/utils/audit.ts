import prisma from '../config/db';

/**
 * Asynchronously logs system transactions and updates to the database
 */
export const logAudit = (
  userId: number | null,
  action: string,
  details: string,
  ipAddress?: string
) => {
  prisma.auditLog
    .create({
      data: {
        userId,
        action,
        details,
        ipAddress: ipAddress || null,
      },
    })
    .catch((err) => {
      console.error(`[Audit Failure] Failed to write audit event: ${err.message}`);
    });
};
