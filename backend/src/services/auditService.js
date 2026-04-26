import { prisma } from '../db.js';

export async function logAudit({
  actorId = null,
  requestId = null,
  entityType,
  entityId,
  action,
  metadata = null,
}) {
  return prisma.auditLog.create({
    data: {
      actorId,
      requestId,
      entityType,
      entityId,
      action,
      metadata,
    },
  });
}
