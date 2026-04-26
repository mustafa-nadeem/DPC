-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SECRETARY', 'ADMIN');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM (
  'SUBMITTED',
  'UNDER_REVIEW',
  'AWAITING_MORE_INFORMATION',
  'AWAITING_CALL_BACK',
  'APPOINTMENT_PROPOSED',
  'PAYMENT_PENDING',
  'CONFIRMED',
  'DECLINED',
  'REFERRED_ELSEWHERE',
  'CANCELLED'
);

-- CreateEnum
CREATE TYPE "RequestCategory" AS ENUM ('NEW_ENQUIRY', 'FOLLOW_UP', 'URGENT', 'ROUTINE', 'NOT_SUITABLE');

-- CreateEnum
CREATE TYPE "RequestActionType" AS ENUM ('ASK_FOR_MORE_INFORMATION', 'CALL_PATIENT', 'BOOK_APPOINTMENT', 'DECLINE_OR_REFER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE');

-- CreateTable
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'SECRETARY',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingRequest" (
  "id" TEXT NOT NULL,
  "publicId" TEXT NOT NULL,
  "title" TEXT,
  "firstName" TEXT NOT NULL,
  "surname" TEXT NOT NULL,
  "dateOfBirth" TIMESTAMP(3),
  "gender" TEXT,
  "email" TEXT NOT NULL,
  "mobile" TEXT NOT NULL,
  "addressLookup" TEXT,
  "gpPractice" TEXT,
  "noGp" BOOLEAN NOT NULL DEFAULT false,
  "reason" TEXT NOT NULL,
  "preferredDate" TIMESTAMP(3),
  "preferredTimeText" TEXT,
  "consent" BOOLEAN NOT NULL DEFAULT false,
  "status" "RequestStatus" NOT NULL DEFAULT 'SUBMITTED',
  "category" "RequestCategory" NOT NULL DEFAULT 'NEW_ENQUIRY',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestNote" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "authorId" TEXT,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RequestNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestStatusHistory" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "fromStatus" "RequestStatus",
  "toStatus" "RequestStatus" NOT NULL,
  "changedById" TEXT,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RequestStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestAction" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "actionType" "RequestActionType" NOT NULL,
  "actorId" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RequestAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityDay" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AvailabilityDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySlot" (
  "id" TEXT NOT NULL,
  "dayId" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL DEFAULT 1,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "reservedCount" INTEGER NOT NULL DEFAULT 0,
  "appointmentCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "slotId" TEXT,
  "appointmentAt" TIMESTAMP(3) NOT NULL,
  "location" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "provider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE',
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amountMinor" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'gbp',
  "paymentLinkUrl" TEXT,
  "checkoutSessionId" TEXT,
  "providerPaymentId" TEXT,
  "providerEventId" TEXT,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "requestId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "BookingRequest_publicId_key" ON "BookingRequest"("publicId");
CREATE INDEX "BookingRequest_status_category_createdAt_idx" ON "BookingRequest"("status", "category", "createdAt");
CREATE INDEX "RequestNote_requestId_createdAt_idx" ON "RequestNote"("requestId", "createdAt");
CREATE INDEX "RequestStatusHistory_requestId_createdAt_idx" ON "RequestStatusHistory"("requestId", "createdAt");
CREATE INDEX "RequestAction_requestId_createdAt_idx" ON "RequestAction"("requestId", "createdAt");
CREATE UNIQUE INDEX "AvailabilityDay_date_key" ON "AvailabilityDay"("date");
CREATE UNIQUE INDEX "AvailabilitySlot_dayId_time_key" ON "AvailabilitySlot"("dayId", "time");
CREATE INDEX "Appointment_requestId_idx" ON "Appointment"("requestId");
CREATE INDEX "Payment_requestId_status_idx" ON "Payment"("requestId", "status");
CREATE INDEX "Payment_providerEventId_idx" ON "Payment"("providerEventId");
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");
CREATE INDEX "AuditLog_requestId_createdAt_idx" ON "AuditLog"("requestId", "createdAt");

-- AddForeignKey
ALTER TABLE "RequestNote"
  ADD CONSTRAINT "RequestNote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RequestNote"
  ADD CONSTRAINT "RequestNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RequestStatusHistory"
  ADD CONSTRAINT "RequestStatusHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RequestStatusHistory"
  ADD CONSTRAINT "RequestStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RequestAction"
  ADD CONSTRAINT "RequestAction_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RequestAction"
  ADD CONSTRAINT "RequestAction_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AvailabilitySlot"
  ADD CONSTRAINT "AvailabilitySlot_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "AvailabilityDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AvailabilitySlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BookingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
