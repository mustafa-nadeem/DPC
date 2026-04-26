import { Router } from 'express';
import { PaymentStatus, RequestStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../db.js';
import { HttpError } from '../../lib/httpError.js';
import { env } from '../../config/env.js';
import { createStripePaymentLink, parseStripeWebhook } from '../../services/stripeService.js';
import { sendTemplatedEmail } from '../../services/emailService.js';
import { logAudit } from '../../services/auditService.js';
import { requireRole } from '../../middleware/auth.js';

const router = Router();

const createPaymentLinkSchema = z.object({
  amountMinor: z.number().int().positive().default(20000),
  currency: z.string().trim().length(3).default('gbp'),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

const STRIPE_SUCCESS_EVENT_TYPES = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
]);

router.get('/', requireRole('ADMIN', 'SECRETARY', 'CLINICIAN'), async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        request: true,
      },
      take: 200,
    });

    const summary = payments.reduce(
      (acc, payment) => {
        if (payment.status === PaymentStatus.PAID) acc.paidMinor += payment.amountMinor;
        if (payment.status === PaymentStatus.PENDING) acc.pendingMinor += payment.amountMinor;
        return acc;
      },
      { paidMinor: 0, pendingMinor: 0 }
    );

    res.json({ payments, summary });
  } catch (error) {
    next(error);
  }
});

router.post('/requests/:requestId/payment-link', requireRole('ADMIN', 'SECRETARY'), async (req, res, next) => {
  try {
    const input = createPaymentLinkSchema.parse(req.body);
    const request = await prisma.bookingRequest.findUnique({
      where: { id: req.params.requestId },
    });
    if (!request) throw new HttpError(404, 'Request not found');

    const paymentLink = await createStripePaymentLink({
      publicId: request.publicId,
      amountMinor: input.amountMinor,
      currency: input.currency.toLowerCase(),
      patientEmail: request.email,
      successUrl: input.successUrl || `${env.frontendOrigin}/booking/confirmation`,
      cancelUrl: input.cancelUrl || `${env.frontendOrigin}/contact`,
    });

    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          requestId: request.id,
          amountMinor: input.amountMinor,
          currency: input.currency.toLowerCase(),
          status: PaymentStatus.PENDING,
          paymentLinkUrl: paymentLink.url,
          providerPaymentId: paymentLink.providerPaymentId,
          checkoutSessionId: paymentLink.checkoutSessionId,
        },
      });

      if (request.status !== RequestStatus.PAYMENT_PENDING) {
        await tx.bookingRequest.update({
          where: { id: request.id },
          data: { status: RequestStatus.PAYMENT_PENDING },
        });
      }

      if (request.status !== RequestStatus.PAYMENT_PENDING) {
        await tx.requestStatusHistory.create({
          data: {
            requestId: request.id,
            fromStatus: request.status,
            toStatus: RequestStatus.PAYMENT_PENDING,
            changedById: req.user.id,
            reason: 'Payment link sent',
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          requestId: request.id,
          entityType: 'payment',
          entityId: created.id,
          action: 'payment_link_created',
          metadata: { amountMinor: input.amountMinor, currency: input.currency, url: paymentLink.url },
        },
      });

      return created;
    });

    await sendTemplatedEmail({
      to: request.email,
      type: 'payment_link',
      payload: { ...request, paymentLinkUrl: paymentLink.url },
    });

    res.status(201).json({ payment, paymentLinkUrl: paymentLink.url, mock: paymentLink.mock });
  } catch (error) {
    next(error);
  }
});

router.post('/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    const event = parseStripeWebhook(req.body, signature);

    const eventType = event.type || event?.data?.object?.type;
    const object = event.data?.object || event;
    if (!STRIPE_SUCCESS_EVENT_TYPES.has(eventType)) {
      return res.json({ received: true, ignored: true });
    }

    const sessionId = object.id;
    const paymentIntent = object.payment_intent ? String(object.payment_intent) : null;
    const publicId = object.metadata?.requestPublicId || null;
    if (!sessionId && !paymentIntent && !publicId) {
      return res.json({ received: true, ignored: true });
    }

    let payment = await prisma.payment.findFirst({
      where: {
        OR: [
          ...(sessionId ? [{ checkoutSessionId: sessionId }] : []),
          ...(paymentIntent ? [{ providerPaymentId: paymentIntent }] : []),
        ],
      },
      include: { request: true },
    });

    if (!payment && publicId) {
      payment = await prisma.payment.findFirst({
        where: {
          request: { publicId },
          status: PaymentStatus.PENDING,
        },
        include: { request: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!payment) return res.json({ received: true, ignored: true });
    if (payment.providerEventId === event.id || payment.status === PaymentStatus.PAID) {
      return res.json({ received: true, duplicate: true });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          providerEventId: event.id || null,
          providerPaymentId: paymentIntent || payment.providerPaymentId,
          checkoutSessionId: sessionId || payment.checkoutSessionId,
        },
      });

      if (payment.request.status !== RequestStatus.CONFIRMED) {
        await tx.bookingRequest.update({
          where: { id: payment.requestId },
          data: { status: RequestStatus.CONFIRMED },
        });

        await tx.requestStatusHistory.create({
          data: {
            requestId: payment.requestId,
            fromStatus: payment.request.status,
            toStatus: RequestStatus.CONFIRMED,
            reason: 'Stripe payment confirmed',
          },
        });
      }

      if (payment.request.preferredDate && payment.request.preferredTimeText) {
        let slot = null;
        if (payment.request.reservedSlotId) {
          slot = await tx.availabilitySlot.findUnique({
            where: { id: payment.request.reservedSlotId },
          });
        }
        if (!slot) {
          const day = await tx.availabilityDay.findUnique({
            where: { date: payment.request.preferredDate },
          });
          if (day) {
            slot = await tx.availabilitySlot.findFirst({
              where: { dayId: day.id, time: payment.request.preferredTimeText },
            });
          }
        }
        if (slot) {
          await tx.availabilitySlot.update({
            where: { id: slot.id },
            data: {
              appointmentCount: { increment: 1 },
              reservedCount: { decrement: slot.reservedCount > 0 ? 1 : 0 },
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          requestId: payment.requestId,
          entityType: 'payment',
          entityId: payment.id,
          action: 'payment_confirmed_webhook',
          metadata: { eventId: event.id, sessionId, paymentIntent },
        },
      });
    });

    await sendTemplatedEmail({
      to: payment.request.email,
      type: 'payment_confirmed',
      payload: payment.request,
    });

    res.json({ received: true, processed: true });
  } catch (error) {
    next(error);
  }
});

export default router;
