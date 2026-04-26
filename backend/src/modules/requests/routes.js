import { Router } from 'express';
import { z } from 'zod';
import { RequestActionType, RequestCategory, RequestStatus } from '@prisma/client';
import { prisma } from '../../db.js';
import { HttpError } from '../../lib/httpError.js';
import { canTransition } from '../../constants/workflow.js';
import { formatRequest } from '../shared/serializers.js';
import { logAudit } from '../../services/auditService.js';
import { sendTemplatedEmail } from '../../services/emailService.js';
import { requireRole } from '../../middleware/auth.js';

const router = Router();

const updateRequestSchema = z.object({
  status: z.nativeEnum(RequestStatus).optional(),
  category: z.nativeEnum(RequestCategory).optional(),
  actionType: z.nativeEnum(RequestActionType).optional(),
  actionNotes: z.string().max(2000).optional().nullable(),
  reason: z.string().max(500).optional().nullable(),
});

const addNoteSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});

const proposeAppointmentSchema = z.object({
  slotId: z.string().cuid(),
  location: z.string().trim().max(220).optional().nullable(),
});

router.get('/', requireRole('ADMIN', 'SECRETARY', 'CLINICIAN'), async (req, res, next) => {
  try {
    const { status, category, q } = req.query;
    const where = {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { publicId: { contains: String(q), mode: 'insensitive' } },
              { firstName: { contains: String(q), mode: 'insensitive' } },
              { surname: { contains: String(q), mode: 'insensitive' } },
              { email: { contains: String(q), mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const requests = await prisma.bookingRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json({ requests: requests.map(formatRequest) });
  } catch (error) {
    next(error);
  }
});

router.get('/:requestId', requireRole('ADMIN', 'SECRETARY', 'CLINICIAN'), async (req, res, next) => {
  try {
    const request = await prisma.bookingRequest.findUnique({
      where: { id: req.params.requestId },
      include: {
        notes: { orderBy: { createdAt: 'desc' }, include: { author: true } },
        actions: { orderBy: { createdAt: 'desc' }, include: { actor: true } },
        statusHistory: { orderBy: { createdAt: 'desc' }, include: { changedBy: true } },
        appointments: { orderBy: { createdAt: 'desc' } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!request) throw new HttpError(404, 'Request not found');

    res.json({
      request: formatRequest(request),
      notes: request.notes,
      actions: request.actions,
      statusHistory: request.statusHistory,
      appointments: request.appointments,
      payments: request.payments,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:requestId', requireRole('ADMIN', 'SECRETARY'), async (req, res, next) => {
  try {
    const input = updateRequestSchema.parse(req.body);
    const existing = await prisma.bookingRequest.findUnique({
      where: { id: req.params.requestId },
    });
    if (!existing) throw new HttpError(404, 'Request not found');

    if (input.status && !canTransition(existing.status, input.status)) {
      throw new HttpError(400, `Invalid status transition from ${existing.status} to ${input.status}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.bookingRequest.update({
        where: { id: existing.id },
        data: {
          ...(input.status ? { status: input.status } : {}),
          ...(input.category ? { category: input.category } : {}),
        },
      });

      if (input.status && input.status !== existing.status) {
        await tx.requestStatusHistory.create({
          data: {
            requestId: existing.id,
            fromStatus: existing.status,
            toStatus: input.status,
            changedById: req.user.id,
            reason: input.reason || null,
          },
        });
      }

      if (input.actionType) {
        await tx.requestAction.create({
          data: {
            requestId: existing.id,
            actionType: input.actionType,
            actorId: req.user.id,
            notes: input.actionNotes || null,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          requestId: existing.id,
          entityType: 'booking_request',
          entityId: existing.id,
          action: 'request_updated',
          metadata: { before: existing, patch: input },
        },
      });

      return next;
    });

    if (input.status === RequestStatus.AWAITING_MORE_INFORMATION) {
      await sendTemplatedEmail({
        to: updated.email,
        type: 'request_more_information',
        payload: updated,
      });
    }
    if (input.status === RequestStatus.DECLINED || input.status === RequestStatus.REFERRED_ELSEWHERE) {
      await sendTemplatedEmail({
        to: updated.email,
        type: 'request_declined',
        payload: updated,
      });
    }

    res.json({ request: formatRequest(updated) });
  } catch (error) {
    next(error);
  }
});

router.post('/:requestId/notes', requireRole('ADMIN', 'SECRETARY'), async (req, res, next) => {
  try {
    const input = addNoteSchema.parse(req.body);
    const existing = await prisma.bookingRequest.findUnique({
      where: { id: req.params.requestId },
    });
    if (!existing) throw new HttpError(404, 'Request not found');

    const note = await prisma.requestNote.create({
      data: {
        requestId: existing.id,
        authorId: req.user.id,
        body: input.body,
      },
      include: { author: true },
    });

    await logAudit({
      actorId: req.user.id,
      requestId: existing.id,
      entityType: 'request_note',
      entityId: note.id,
      action: 'note_created',
      metadata: { bodyLength: input.body.length },
    });

    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
});

router.post('/:requestId/propose-appointment', requireRole('ADMIN', 'SECRETARY'), async (req, res, next) => {
  try {
    const input = proposeAppointmentSchema.parse(req.body);
    const existing = await prisma.bookingRequest.findUnique({
      where: { id: req.params.requestId },
    });
    if (!existing) throw new HttpError(404, 'Request not found');

    const output = await prisma.$transaction(async (tx) => {
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: input.slotId },
        include: { day: true },
      });
      if (!slot) throw new HttpError(404, 'Slot not found');
      if (!slot.enabled) throw new HttpError(400, 'Slot is disabled');
      const activeCount = slot.reservedCount + slot.appointmentCount;
      const alreadyReservedByRequest = existing.reservedSlotId === slot.id;
      if (!alreadyReservedByRequest && activeCount >= slot.capacity) {
        throw new HttpError(400, 'Slot has no remaining capacity');
      }

      const appointmentAt = new Date(`${slot.day.date.toISOString().slice(0, 10)}T${slot.time}:00.000Z`);
      const appointment = await tx.appointment.create({
        data: {
          requestId: existing.id,
          slotId: slot.id,
          appointmentAt,
          location: input.location || null,
        },
      });

      if (!alreadyReservedByRequest) {
        await tx.availabilitySlot.update({
          where: { id: slot.id },
          data: { reservedCount: { increment: 1 } },
        });
      }

      const updated = await tx.bookingRequest.update({
        where: { id: existing.id },
        data: {
          status: RequestStatus.PAYMENT_PENDING,
          preferredDate: slot.day.date,
          preferredTimeText: slot.time,
          reservedSlotId: slot.id,
        },
      });

      await tx.requestStatusHistory.create({
        data: {
          requestId: existing.id,
          fromStatus: existing.status,
          toStatus: RequestStatus.PAYMENT_PENDING,
          changedById: req.user.id,
          reason: 'Appointment proposed and payment pending',
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          requestId: existing.id,
          entityType: 'appointment',
          entityId: appointment.id,
          action: 'appointment_proposed',
          metadata: { slotId: slot.id, appointmentAt },
        },
      });

      return { appointment, request: updated };
    });

    res.status(201).json(output);
  } catch (error) {
    next(error);
  }
});

export default router;
