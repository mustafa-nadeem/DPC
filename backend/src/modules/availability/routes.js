import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db.js';
import { HttpError } from '../../lib/httpError.js';
import { formatAvailability } from '../shared/serializers.js';
import { logAudit } from '../../services/auditService.js';
import { requireRole } from '../../middleware/auth.js';

const router = Router();

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const upsertDaySchema = z.object({
  slots: z.array(
    z.object({
      time: z.string().regex(/^\d{2}:\d{2}$/),
      capacity: z.number().int().min(0).default(1),
      enabled: z.boolean().default(true),
    })
  ),
});

const createSlotSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  capacity: z.number().int().min(0).default(1),
  enabled: z.boolean().default(true),
});

const updateSlotSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  capacity: z.number().int().min(0).optional(),
  enabled: z.boolean().optional(),
});

router.get('/', requireRole('ADMIN', 'SECRETARY', 'CLINICIAN'), async (req, res, next) => {
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

router.put('/:date', requireRole('ADMIN', 'SECRETARY'), async (req, res, next) => {
  try {
    const dateValue = dateSchema.parse(req.params.date);
    const input = upsertDaySchema.parse(req.body);

    const day = await prisma.$transaction(async (tx) => {
      const existing = await tx.availabilityDay.upsert({
        where: { date: new Date(`${dateValue}T00:00:00.000Z`) },
        update: {},
        create: { date: new Date(`${dateValue}T00:00:00.000Z`) },
      });

      await tx.availabilitySlot.deleteMany({ where: { dayId: existing.id } });
      await tx.availabilitySlot.createMany({
        data: input.slots.map((slot) => ({
          dayId: existing.id,
          time: slot.time,
          capacity: slot.capacity,
          enabled: slot.enabled,
        })),
      });

      return tx.availabilityDay.findUnique({
        where: { id: existing.id },
        include: { slots: true },
      });
    });

    await logAudit({
      actorId: req.user.id,
      entityType: 'availability_day',
      entityId: day.id,
      action: 'availability_day_upserted',
      metadata: { date: dateValue, slotCount: day.slots.length },
    });

    res.json({ day: formatAvailability([day])[0] });
  } catch (error) {
    next(error);
  }
});

router.post('/:date/slots', requireRole('ADMIN', 'SECRETARY'), async (req, res, next) => {
  try {
    const dateValue = dateSchema.parse(req.params.date);
    const input = createSlotSchema.parse(req.body);
    const day = await prisma.availabilityDay.upsert({
      where: { date: new Date(`${dateValue}T00:00:00.000Z`) },
      update: {},
      create: { date: new Date(`${dateValue}T00:00:00.000Z`) },
    });

    const slot = await prisma.availabilitySlot.create({
      data: {
        dayId: day.id,
        time: input.time,
        capacity: input.capacity,
        enabled: input.enabled,
      },
    });

    await logAudit({
      actorId: req.user.id,
      entityType: 'availability_slot',
      entityId: slot.id,
      action: 'availability_slot_created',
      metadata: { dayId: day.id, time: slot.time },
    });

    res.status(201).json({ slot });
  } catch (error) {
    next(error);
  }
});

router.patch('/slots/:slotId', requireRole('ADMIN', 'SECRETARY'), async (req, res, next) => {
  try {
    const input = updateSlotSchema.parse(req.body);
    const existing = await prisma.availabilitySlot.findUnique({
      where: { id: req.params.slotId },
    });
    if (!existing) throw new HttpError(404, 'Slot not found');

    const slot = await prisma.availabilitySlot.update({
      where: { id: existing.id },
      data: input,
    });

    await logAudit({
      actorId: req.user.id,
      entityType: 'availability_slot',
      entityId: slot.id,
      action: 'availability_slot_updated',
      metadata: { before: existing, patch: input },
    });

    res.json({ slot });
  } catch (error) {
    next(error);
  }
});

router.delete('/slots/:slotId', requireRole('ADMIN', 'SECRETARY'), async (req, res, next) => {
  try {
    const existing = await prisma.availabilitySlot.findUnique({
      where: { id: req.params.slotId },
    });
    if (!existing) throw new HttpError(404, 'Slot not found');

    await prisma.availabilitySlot.delete({ where: { id: existing.id } });

    await logAudit({
      actorId: req.user.id,
      entityType: 'availability_slot',
      entityId: existing.id,
      action: 'availability_slot_deleted',
      metadata: { time: existing.time, dayId: existing.dayId },
    });

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
