import { PrismaClient, RequestStatus, RequestCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: process.env.ADMIN_EMAIL || 'admin@daventryclinic.local', role: 'ADMIN', firstName: 'Clinic', lastName: 'Admin' },
    { email: process.env.SECRETARY_EMAIL || 'secretary@daventryclinic.local', role: 'SECRETARY', firstName: 'Clinic', lastName: 'Secretary' },
    { email: process.env.CLINICIAN_EMAIL || 'clinician@daventryclinic.local', role: 'CLINICIAN', firstName: 'Clinic', lastName: 'Clinician' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email.toLowerCase() },
      update: { isActive: true, role: user.role },
      create: {
        email: user.email.toLowerCase(),
        passwordHash: null,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }

  const sampleDay = await prisma.availabilityDay.upsert({
    where: { date: new Date('2026-05-04T00:00:00.000Z') },
    update: {},
    create: { date: new Date('2026-05-04T00:00:00.000Z') },
  });

  await prisma.availabilitySlot.upsert({
    where: { dayId_time: { dayId: sampleDay.id, time: '09:00' } },
    update: { capacity: 4, enabled: true },
    create: { dayId: sampleDay.id, time: '09:00', capacity: 4, enabled: true },
  });

  const existingRequest = await prisma.bookingRequest.findFirst({
    where: { publicId: 'REQ-1001' },
  });

  if (!existingRequest) {
    await prisma.bookingRequest.create({
      data: {
        publicId: 'REQ-1001',
        firstName: 'Sarah',
        surname: 'Bennett',
        email: 'sarah@example.com',
        mobile: '+447000000001',
        reason: 'Persistent skin irritation and follow-up consultation.',
        status: RequestStatus.UNDER_REVIEW,
        category: RequestCategory.ROUTINE,
        consent: true,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
