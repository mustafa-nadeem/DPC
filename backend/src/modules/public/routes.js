import { Router } from 'express';
import { z } from 'zod';
import { RequestStatus } from '@prisma/client';
import { prisma } from '../../db.js';
import { HttpError } from '../../lib/httpError.js';
import { formatAvailability, formatRequest } from '../shared/serializers.js';
import { sendTemplatedEmail } from '../../services/emailService.js';
import { logAudit } from '../../services/auditService.js';

const router = Router();

const createRequestSchema = z.object({
  title: z.string().trim().max(30).optional().nullable(),
  firstName: z.string().trim().min(1).max(120),
  surname: z.string().trim().min(1).max(120),
  dateOfBirth: z.string().trim().optional().nullable(),
  gender: z.string().trim().max(40).optional().nullable(),
  email: z.string().email(),
  mobile: z.string().trim().min(5).max(40),
  addressLookup: z.string().trim().max(220).optional().nullable(),
  gpPractice: z.string().trim().max(220).optional().nullable(),
  noGp: z.boolean().default(false),
  reason: z.string().trim().min(5).max(2000),
  preferredDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  preferredTime: z.string().trim().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  consent: z.literal(true),
});

function parseDob(input) {
  if (!input) return null;
  const ukMatch = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ukMatch) {
    const [, dd, mm, yyyy] = ukMatch;
    const dt = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
    if (!Number.isNaN(dt.getTime())) return dt;
  }
  const direct = new Date(input);
  return Number.isNaN(direct.getTime()) ? null : direct;
}

async function generatePublicId() {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = `REQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const exists = await prisma.bookingRequest.findUnique({
      where: { publicId: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }
  return `REQ-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 90 + 10)}`;
}

router.get('/availability', async (req, res, next) => {
  try {
    const days = await prisma.availabilityDay.findMany({
      orderBy: { date: 'asc' },
      include: { slots: true },
    });
    res.json({ availability: formatAvailability(days) });
  } catch (error) {
    next(error);
  }
});

router.post('/requests', async (req, res, next) => {
  try {
    const input = createRequestSchema.parse(req.body);
    if ((input.preferredDate && !input.preferredTime) || (!input.preferredDate && input.preferredTime)) {
      throw new HttpError(400, 'Preferred date and time must both be provided');
    }

    const publicId = await generatePublicId();
    const created = await prisma.$transaction(async (tx) => {
      let reservedSlotId = null;

      if (input.preferredDate && input.preferredTime) {
        const dayDate = new Date(`${input.preferredDate}T00:00:00.000Z`);
        const day = await tx.availabilityDay.findUnique({
          where: { date: dayDate },
          include: { slots: true },
        });
        if (!day) {
          throw new HttpError(409, 'Selected date is no longer available');
        }

        const slot = day.slots.find((candidate) => candidate.time === input.preferredTime);
        if (!slot || !slot.enabled) {
          throw new HttpError(409, 'Selected time is no longer available');
        }

        const usedCapacity = slot.reservedCount + slot.appointmentCount;
        if (usedCapacity >= slot.capacity) {
          throw new HttpError(409, 'Selected slot is fully booked');
        }

        const duplicateActiveRequest = await tx.bookingRequest.findFirst({
          where: {
            email: input.email.toLowerCase(),
            preferredDate: dayDate,
            preferredTimeText: input.preferredTime,
            status: {
              in: [
                RequestStatus.SUBMITTED,
                RequestStatus.UNDER_REVIEW,
                RequestStatus.AWAITING_MORE_INFORMATION,
                RequestStatus.AWAITING_CALL_BACK,
                RequestStatus.APPOINTMENT_PROPOSED,
                RequestStatus.PAYMENT_PENDING,
                RequestStatus.CONFIRMED,
              ],
            },
          },
          select: { id: true, publicId: true },
        });

        if (duplicateActiveRequest) {
          throw new HttpError(409, 'A request for this slot already exists for this patient email');
        }

        await tx.availabilitySlot.update({
          where: { id: slot.id },
          data: { reservedCount: { increment: 1 } },
        });
        reservedSlotId = slot.id;
      }

      return tx.bookingRequest.create({
        data: {
          publicId,
          title: input.title || null,
          firstName: input.firstName,
          surname: input.surname,
          dateOfBirth: parseDob(input.dateOfBirth),
          gender: input.gender || null,
          email: input.email.toLowerCase(),
          mobile: input.mobile,
          addressLookup: input.addressLookup || null,
          gpPractice: input.gpPractice || null,
          noGp: input.noGp,
          reason: input.reason,
          preferredDate: input.preferredDate ? new Date(`${input.preferredDate}T00:00:00.000Z`) : null,
          preferredTimeText: input.preferredTime || null,
          reservedSlotId,
          consent: input.consent,
          statusHistory: {
            create: {
              toStatus: 'SUBMITTED',
              reason: 'Patient submitted request',
            },
          },
        },
      });
    });

    await logAudit({
      requestId: created.id,
      entityType: 'booking_request',
      entityId: created.id,
      action: 'created_public_request_with_reservation',
      metadata: {
        publicId: created.publicId,
        email: created.email,
        preferredDate: input.preferredDate || null,
        preferredTime: input.preferredTime || null,
        reservedSlotId: created.reservedSlotId || null,
      },
    });

    await sendTemplatedEmail({
      to: created.email,
      type: 'request_acknowledgement',
      payload: created,
    });

    res.status(201).json({ request: formatRequest(created) });
  } catch (error) {
    next(error);
  }
});

export default router;
