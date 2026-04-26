# Portal2 Backend + Workflow Handover

## What was implemented

This project now includes a backend-powered, review-first booking system integrated into the existing React app.

### 1) Backend service added

A new backend app was added in `backend/`:

- Express API server
- PostgreSQL data model through Prisma
- Auth middleware
- Review-first workflow endpoints
- Stripe payment-link + webhook handling
- Email service integration points
- Audit logging

Key backend paths:

- `backend/src/app.js`
- `backend/src/server.js`
- `backend/prisma/schema.prisma`
- `backend/src/modules/public/routes.js`
- `backend/src/modules/requests/routes.js`
- `backend/src/modules/availability/routes.js`
- `backend/src/modules/payments/routes.js`
- `backend/src/modules/auth/routes.js`

### 2) PostgreSQL schema and workflow entities

Schema now includes:

- users (with role and Supabase user linking)
- booking requests
- status history
- notes
- actions
- availability days and slots
- appointments
- payments
- audit logs

Additional reservation support was added:

- `BookingRequest.reservedSlotId`
- reservation linkage to `AvailabilitySlot`

### 3) Public booking submission wired to backend

Public flow now creates real request records:

- `GET /api/public/availability`
- `POST /api/public/requests`

Submit now:

- validates consent/date/time
- creates a request record
- writes status history and audit log
- reserves selected slot with capacity checks
- prevents duplicate active same-slot requests for same patient email
- returns request reference for confirmation page

### 4) Admin review actions now persist

Admin request detail is now fully persistent:

- status updates
- category updates
- action + action notes
- internal notes
- timeline reload from server

APIs used:

- `PATCH /api/admin/requests/:requestId`
- `POST /api/admin/requests/:requestId/notes`
- `GET /api/admin/requests/:requestId`

### 5) Stripe integration completed

Implemented:

- payment link creation from admin
- pending payment persistence
- webhook processing for payment success
- idempotent webhook handling
- request status progression to confirmed
- slot counter transitions from reserved to appointment

Endpoints:

- `POST /api/admin/requests/:requestId/payment-link`
- `POST /api/stripe/webhook`

### 6) Email service integration points

Templated email events are integrated for:

- booking approved/payment link
- more information request
- declined/referred
- payment confirmation

Current provider adapter:

- Resend (with fallback behavior when key is not configured)
- `backend/src/services/emailService.js`

### 7) Supabase auth + RBAC

Temp auth was replaced with Supabase-backed auth checks and role gating:

Roles:

- ADMIN
- SECRETARY
- CLINICIAN

RBAC enforced at:

- backend middleware/route layer
- frontend route guard/nav visibility layer

Frontend now uses Supabase session token with API calls.

### 8) End-to-end workflow test added

A full review-first e2e API test was added:

- `backend/src/__tests__/review-first-workflow.e2e.test.js`

It verifies:

- public submit
- admin review
- notes
- appointment proposal
- payment link creation
- webhook confirmation
- final confirmed state and counters

Run command:

- `npm --prefix backend run test:e2e`

---

## What your team must install/download

From repo root:

- `npm install`

From backend:

- `npm --prefix backend install`

These pull required dependencies for:

- React frontend
- Express backend
- Prisma
- Supabase client
- Stripe SDK
- Resend SDK
- Vitest + Supertest for e2e tests

---

## Required environment variables

### Root `.env`

Create `/.env` with:

- `REACT_APP_API_BASE_URL=http://localhost:4000/api`
- `REACT_APP_SUPABASE_URL=<your-supabase-url>`
- `REACT_APP_SUPABASE_ANON_KEY=<your-supabase-anon-key>`

### Backend `.env`

Create `/backend/.env` with:

- `PORT=4000`
- `NODE_ENV=development`
- `FRONTEND_ORIGIN=http://localhost:3000`
- `DATABASE_URL=<postgres-connection-string>`
- `SUPABASE_URL=<your-supabase-url>`
- `SUPABASE_ANON_KEY=<your-supabase-anon-key>`
- `SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>`
- `STRIPE_SECRET_KEY=<stripe-secret-key>`
- `STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>`
- `STRIPE_CURRENCY=gbp`
- `RESEND_API_KEY=<resend-api-key>`
- `EMAIL_FROM=<from-email>`
- `ADMIN_EMAIL=admin@daventryclinic.local`
- `SECRETARY_EMAIL=secretary@daventryclinic.local`
- `CLINICIAN_EMAIL=clinician@daventryclinic.local`

---

## Database setup commands

Run:

- `npm --prefix backend run prisma:generate`
- `npm --prefix backend run prisma:migrate`
- `npm --prefix backend run seed`

---

## How to run locally

Terminal 1 (frontend):

- `npm start`

Terminal 2 (backend):

- `npm --prefix backend run dev`

Health check:

- `GET http://localhost:4000/api/health`

---

## Logins to test

Auth now uses Supabase, so passwords are not stored in this repository.

Seeded application users (roles in DB) are:

- `admin@daventryclinic.local` (ADMIN)
- `secretary@daventryclinic.local` (SECRETARY)
- `clinician@daventryclinic.local` (CLINICIAN)

To log in, create matching Supabase Auth users for these emails and assign passwords in Supabase Auth dashboard (or via Supabase admin API). Then use those credentials on `/admin/login`.

---

## Notes for the team

- If Stripe keys are omitted, payment link flow uses a mock URL path so UI flow still works.
- Webhook endpoint expects raw body parsing and is already configured in backend app.
- Reservation logic now prevents overbooking and double-reserve behavior during request progression.
