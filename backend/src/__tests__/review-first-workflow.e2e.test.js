import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const store = {
  users: [],
  bookingRequests: [],
  notes: [],
  actions: [],
  statusHistory: [],
  appointments: [],
  payments: [],
  auditLogs: [],
  availabilityDays: [],
  availabilitySlots: [],
};

let seq = 1;
const nextId = (prefix) => `${prefix}_${seq++}`;

function resetStore() {
  seq = 1;
  store.users = [{ id: 'u_secretary', email: 'secretary@clinic.local', role: 'SECRETARY', isActive: true }];
  store.bookingRequests = [];
  store.notes = [];
  store.actions = [];
  store.statusHistory = [];
  store.appointments = [];
  store.payments = [];
  store.auditLogs = [];
  store.availabilityDays = [{ id: 'day_1', date: new Date('2026-06-01T00:00:00.000Z') }];
  store.availabilitySlots = [
    {
      id: 'c12345678901234567890123',
      dayId: 'day_1',
      time: '09:00',
      capacity: 2,
      enabled: true,
      reservedCount: 0,
      appointmentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

function clone(obj) {
  return structuredClone(obj);
}

const prismaMock = {
  $transaction: async (fn) => fn(prismaMock),
  user: {
    findFirst: async () => store.users[0] || null,
    findUnique: async ({ where }) => store.users.find((u) => u.id === where.id) || null,
    update: async ({ where, data }) => {
      const idx = store.users.findIndex((u) => u.id === where.id);
      store.users[idx] = { ...store.users[idx], ...data };
      return clone(store.users[idx]);
    },
  },
  bookingRequest: {
    findUnique: async ({ where, include }) => {
      const request = store.bookingRequests.find((r) => r.id === where.id || r.publicId === where.publicId) || null;
      if (!request) return null;
      if (!include) return clone(request);
      return {
        ...clone(request),
        notes: store.notes.filter((n) => n.requestId === request.id).sort((a, b) => b.createdAt - a.createdAt),
        actions: store.actions.filter((a) => a.requestId === request.id).sort((a, b) => b.createdAt - a.createdAt),
        statusHistory: store.statusHistory.filter((s) => s.requestId === request.id).sort((a, b) => b.createdAt - a.createdAt),
        appointments: store.appointments.filter((a) => a.requestId === request.id).sort((a, b) => b.createdAt - a.createdAt),
        payments: store.payments.filter((p) => p.requestId === request.id).sort((a, b) => b.createdAt - a.createdAt),
      };
    },
    findFirst: async ({ where, select, orderBy }) => {
      let list = [...store.bookingRequests];
      if (where?.publicId) list = list.filter((r) => r.publicId === where.publicId);
      if (where?.email) list = list.filter((r) => r.email === where.email);
      if (where?.preferredDate) {
        list = list.filter((r) => r.preferredDate && new Date(r.preferredDate).toISOString() === new Date(where.preferredDate).toISOString());
      }
      if (where?.preferredTimeText) list = list.filter((r) => r.preferredTimeText === where.preferredTimeText);
      if (where?.status?.in) list = list.filter((r) => where.status.in.includes(r.status));
      if (where?.request?.publicId) {
        const req = store.bookingRequests.find((r) => r.publicId === where.request.publicId);
        list = req ? list.filter((p) => p.requestId === req.id) : [];
      }
      if (orderBy?.createdAt === 'desc') list.sort((a, b) => b.createdAt - a.createdAt);
      const row = list[0] || null;
      if (!row) return null;
      if (select) return { id: row.id };
      return clone(row);
    },
    findMany: async ({ where, orderBy }) => {
      let list = [...store.bookingRequests];
      if (where?.status) list = list.filter((r) => r.status === where.status);
      if (where?.category) list = list.filter((r) => r.category === where.category);
      if (orderBy?.createdAt === 'desc') list.sort((a, b) => b.createdAt - a.createdAt);
      return clone(list);
    },
    create: async ({ data }) => {
      const row = {
        id: nextId('req'),
        publicId: data.publicId,
        title: data.title || null,
        firstName: data.firstName,
        surname: data.surname,
        dateOfBirth: data.dateOfBirth || null,
        gender: data.gender || null,
        email: data.email,
        mobile: data.mobile,
        addressLookup: data.addressLookup || null,
        gpPractice: data.gpPractice || null,
        noGp: data.noGp || false,
        reason: data.reason,
        preferredDate: data.preferredDate || null,
        preferredTimeText: data.preferredTimeText || null,
        reservedSlotId: data.reservedSlotId || null,
        consent: data.consent || false,
        status: 'SUBMITTED',
        category: 'NEW_ENQUIRY',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.bookingRequests.push(row);
      if (data.statusHistory?.create) {
        store.statusHistory.push({
          id: nextId('status'),
          requestId: row.id,
          fromStatus: null,
          toStatus: data.statusHistory.create.toStatus,
          reason: data.statusHistory.create.reason,
          createdAt: new Date(),
          changedBy: null,
          changedById: null,
        });
      }
      return clone(row);
    },
    update: async ({ where, data }) => {
      const idx = store.bookingRequests.findIndex((r) => r.id === where.id);
      store.bookingRequests[idx] = {
        ...store.bookingRequests[idx],
        ...data,
        updatedAt: new Date(),
      };
      return clone(store.bookingRequests[idx]);
    },
  },
  availabilityDay: {
    findMany: async ({ include }) => {
      const days = store.availabilityDays.map((d) => ({
        ...d,
        slots: include?.slots ? store.availabilitySlots.filter((s) => s.dayId === d.id) : undefined,
      }));
      return clone(days);
    },
    findUnique: async ({ where, include }) => {
      const day = store.availabilityDays.find((d) => new Date(d.date).toISOString() === new Date(where.date).toISOString()) || null;
      if (!day) return null;
      return clone({
        ...day,
        slots: include?.slots ? store.availabilitySlots.filter((s) => s.dayId === day.id) : undefined,
      });
    },
  },
  availabilitySlot: {
    findUnique: async ({ where, include }) => {
      const slot = store.availabilitySlots.find((s) => s.id === where.id) || null;
      if (!slot) return null;
      if (!include?.day) return clone(slot);
      const day = store.availabilityDays.find((d) => d.id === slot.dayId);
      return clone({ ...slot, day });
    },
    findFirst: async ({ where }) => {
      const slot = store.availabilitySlots.find((s) => s.dayId === where.dayId && s.time === where.time) || null;
      return clone(slot);
    },
    update: async ({ where, data }) => {
      const idx = store.availabilitySlots.findIndex((s) => s.id === where.id);
      const current = store.availabilitySlots[idx];
      const next = { ...current };
      if (data.reservedCount?.increment) next.reservedCount += data.reservedCount.increment;
      if (data.reservedCount?.decrement) next.reservedCount = Math.max(0, next.reservedCount - data.reservedCount.decrement);
      if (data.appointmentCount?.increment) next.appointmentCount += data.appointmentCount.increment;
      store.availabilitySlots[idx] = next;
      return clone(next);
    },
  },
  requestStatusHistory: {
    create: async ({ data }) => {
      const row = {
        id: nextId('status'),
        requestId: data.requestId,
        fromStatus: data.fromStatus || null,
        toStatus: data.toStatus,
        reason: data.reason || null,
        changedById: data.changedById || null,
        changedBy: data.changedById ? store.users.find((u) => u.id === data.changedById) || null : null,
        createdAt: new Date(),
      };
      store.statusHistory.push(row);
      return clone(row);
    },
  },
  requestAction: {
    create: async ({ data }) => {
      const row = {
        id: nextId('action'),
        requestId: data.requestId,
        actionType: data.actionType,
        actorId: data.actorId || null,
        actor: data.actorId ? store.users.find((u) => u.id === data.actorId) || null : null,
        notes: data.notes || null,
        createdAt: new Date(),
      };
      store.actions.push(row);
      return clone(row);
    },
  },
  requestNote: {
    create: async ({ data }) => {
      const row = {
        id: nextId('note'),
        requestId: data.requestId,
        authorId: data.authorId,
        author: store.users.find((u) => u.id === data.authorId) || null,
        body: data.body,
        createdAt: new Date(),
      };
      store.notes.push(row);
      return clone(row);
    },
  },
  appointment: {
    create: async ({ data }) => {
      const row = { id: nextId('appt'), ...data, createdAt: new Date(), updatedAt: new Date() };
      store.appointments.push(row);
      return clone(row);
    },
  },
  payment: {
    findMany: async ({ include, orderBy }) => {
      let rows = [...store.payments];
      if (orderBy?.createdAt === 'desc') rows.sort((a, b) => b.createdAt - a.createdAt);
      return clone(
        rows.map((p) => ({
          ...p,
          request: include?.request ? store.bookingRequests.find((r) => r.id === p.requestId) || null : undefined,
        }))
      );
    },
    findFirst: async ({ where, include, orderBy }) => {
      let list = [...store.payments];
      if (where?.OR) {
        list = list.filter((p) =>
          where.OR.some((clause) => (
            (clause.checkoutSessionId && p.checkoutSessionId === clause.checkoutSessionId) ||
            (clause.providerPaymentId && p.providerPaymentId === clause.providerPaymentId)
          ))
        );
      }
      if (where?.request?.publicId) {
        const req = store.bookingRequests.find((r) => r.publicId === where.request.publicId);
        list = req ? list.filter((p) => p.requestId === req.id) : [];
      }
      if (where?.status) list = list.filter((p) => p.status === where.status);
      if (orderBy?.createdAt === 'desc') list.sort((a, b) => b.createdAt - a.createdAt);
      const row = list[0] || null;
      if (!row) return null;
      return clone({
        ...row,
        request: include?.request ? store.bookingRequests.find((r) => r.id === row.requestId) || null : undefined,
      });
    },
    create: async ({ data }) => {
      const row = {
        id: nextId('pay'),
        provider: 'STRIPE',
        status: 'PENDING',
        paymentLinkUrl: null,
        checkoutSessionId: null,
        providerPaymentId: null,
        providerEventId: null,
        paidAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      store.payments.push(row);
      return clone(row);
    },
    update: async ({ where, data }) => {
      const idx = store.payments.findIndex((p) => p.id === where.id);
      store.payments[idx] = { ...store.payments[idx], ...data, updatedAt: new Date() };
      return clone(store.payments[idx]);
    },
  },
  auditLog: {
    create: async ({ data }) => {
      const row = { id: nextId('audit'), createdAt: new Date(), ...data };
      store.auditLogs.push(row);
      return clone(row);
    },
  },
};

vi.mock('../db.js', () => ({
  prisma: prismaMock,
}));

vi.mock('../middleware/auth.js', () => ({
  requireAuth: (req, res, next) => {
    req.user = store.users[0];
    req.role = store.users[0].role;
    next();
  },
  requireRole: (...allowedRoles) => (req, res, next) => {
    if (allowedRoles.includes(req.user.role)) {
      next();
      return;
    }
    res.status(403).json({ message: 'Insufficient permissions' });
  },
}));

vi.mock('../services/emailService.js', () => ({
  sendTemplatedEmail: vi.fn(async () => ({ queued: true, provider: 'test' })),
}));

vi.mock('../services/stripeService.js', () => ({
  createStripePaymentLink: vi.fn(async ({ publicId }) => ({
    url: `https://checkout.stripe.test/${publicId}`,
    providerPaymentId: `pi_${publicId}`,
    checkoutSessionId: `cs_${publicId}`,
    mock: false,
  })),
  parseStripeWebhook: vi.fn((body) => {
    if (Buffer.isBuffer(body)) {
      return JSON.parse(body.toString('utf8'));
    }
    return body;
  }),
}));

describe('review-first workflow e2e', async () => {
  const { createApp } = await import('../app.js');
  const app = createApp();

  beforeEach(() => {
    resetStore();
  });

  it('runs submit -> review -> propose -> payment -> confirm flow', async () => {
    const submit = await request(app)
      .post('/api/public/requests')
      .send({
        title: 'Mr',
        firstName: 'Alex',
        surname: 'Turner',
        dateOfBirth: '08/09/1992',
        gender: 'Male',
        email: 'alex@example.com',
        mobile: '+447700000111',
        addressLookup: '1 Road',
        gpPractice: 'GP A',
        noGp: false,
        reason: 'Rash review',
        preferredDate: '2026-06-01',
        preferredTime: '09:00',
        consent: true,
      });

    expect(submit.status).toBe(201);
    const createdRequestId = submit.body.request.id;
    expect(store.availabilitySlots[0].reservedCount).toBe(1);

    const patch = await request(app)
      .patch(`/api/admin/requests/${createdRequestId}`)
      .set('Authorization', 'Bearer test')
      .send({
        status: 'UNDER_REVIEW',
        category: 'ROUTINE',
        actionType: 'CALL_PATIENT',
        actionNotes: 'Called and validated details',
      });
    expect(patch.status).toBe(200);

    const note = await request(app)
      .post(`/api/admin/requests/${createdRequestId}/notes`)
      .set('Authorization', 'Bearer test')
      .send({ body: 'Patient confirms no allergies.' });
    expect(note.status).toBe(201);

    const propose = await request(app)
      .post(`/api/admin/requests/${createdRequestId}/propose-appointment`)
      .set('Authorization', 'Bearer test')
      .send({ slotId: 'c12345678901234567890123', location: 'Three Shires Hospital' });
    expect(propose.status).toBe(201);
    expect(store.availabilitySlots[0].reservedCount).toBe(1);

    const paymentLink = await request(app)
      .post(`/api/admin/requests/${createdRequestId}/payment-link`)
      .set('Authorization', 'Bearer test')
      .send({ amountMinor: 20000, currency: 'gbp' });
    expect(paymentLink.status).toBe(201);
    expect(paymentLink.body.paymentLinkUrl).toContain('https://checkout.stripe.test');

    const webhook = await request(app)
      .post('/api/stripe/webhook')
      .send({
        id: 'evt_1',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: store.payments[0].checkoutSessionId,
            payment_intent: store.payments[0].providerPaymentId,
            metadata: { requestPublicId: submit.body.request.publicId },
          },
        },
      });
    expect(webhook.status).toBe(200);
    expect(store.payments[0].status).toBe('PAID');
    expect(store.bookingRequests[0].status).toBe('CONFIRMED');
    expect(store.availabilitySlots[0].reservedCount).toBe(0);
    expect(store.availabilitySlots[0].appointmentCount).toBe(1);

    const detail = await request(app)
      .get(`/api/admin/requests/${createdRequestId}`)
      .set('Authorization', 'Bearer test');
    expect(detail.status).toBe(200);
    expect(detail.body.statusHistory.length).toBeGreaterThan(0);
    expect(detail.body.actions.length).toBeGreaterThan(0);
    expect(detail.body.notes.length).toBeGreaterThan(0);
    expect(detail.body.request.status).toBe('CONFIRMED');
  });
});
