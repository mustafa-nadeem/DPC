ALTER TABLE "BookingRequest"
  ADD COLUMN "reservedSlotId" TEXT;

CREATE INDEX "BookingRequest_reservedSlotId_idx" ON "BookingRequest"("reservedSlotId");

ALTER TABLE "BookingRequest"
  ADD CONSTRAINT "BookingRequest_reservedSlotId_fkey"
  FOREIGN KEY ("reservedSlotId") REFERENCES "AvailabilitySlot"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
