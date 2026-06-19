import { PrismaClient, Role, Gender } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding default SaaS users and profiles...');

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  // 1. System Administrator
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@hospital.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1234567890',
      roles: [Role.ADMIN],
      enabled: true,
    },
  });
  console.log(`[Seed] Created/Verified admin user: ${admin.username}`);

  // 2. Doctor Smith
  const doctorUser = await prisma.user.upsert({
    where: { username: 'dr.smith' },
    update: {},
    create: {
      username: 'dr.smith',
      email: 'dr.smith@hospital.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1234567891',
      roles: [Role.DOCTOR],
      enabled: true,
    },
  });

  const doctorProfile = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      firstName: 'John',
      lastName: 'Smith',
      email: 'dr.smith@hospital.com',
      phone: '+1234567891',
      specialization: 'Cardiology',
      licenseNumber: 'MD12345',
      department: 'Cardiology Department',
      experienceYears: 10,
      consultationFee: 150.00,
      bio: 'Experienced cardiologist specializing in heart health and diagnostic testing.',
      available: true,
      schedules: {
        create: [
          { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '15:00' },
        ],
      },
    },
  });
  console.log(`[Seed] Created/Verified doctor profile: Dr. ${doctorProfile.lastName}`);

  // 3. Receptionist Sarah
  const receptionist = await prisma.user.upsert({
    where: { username: 'receptionist1' },
    update: {},
    create: {
      username: 'receptionist1',
      email: 'reception@hospital.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1234567892',
      roles: [Role.RECEPTIONIST],
      enabled: true,
    },
  });
  console.log(`[Seed] Created/Verified receptionist: ${receptionist.username}`);

  // 4. Patient Jane
  const patientUser = await prisma.user.upsert({
    where: { username: 'patient1' },
    update: {},
    create: {
      username: 'patient1',
      email: 'patient@hospital.com',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+1234567893',
      roles: [Role.PATIENT],
      enabled: true,
    },
  });

  const patientProfile = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'patient@hospital.com',
      phone: '+1234567893',
      dateOfBirth: new Date('1990-05-15'),
      gender: Gender.FEMALE,
      bloodGroup: 'O+',
      address: '123 Main St, New York, NY',
      insuranceProvider: 'BlueCross Health',
      insurancePolicyNumber: 'POL-77382-99',
      insuranceExpiry: new Date('2028-12-31'),
      allergies: 'Penicillin, Peanuts',
    },
  });
  console.log(`[Seed] Created/Verified patient profile: ${patientProfile.firstName} ${patientProfile.lastName}`);

  // 5. Billing Staff Mike
  const billing = await prisma.user.upsert({
    where: { username: 'billing1' },
    update: {},
    create: {
      username: 'billing1',
      email: 'billing@hospital.com',
      passwordHash,
      firstName: 'Mike',
      lastName: 'Wilson',
      phone: '+1234567894',
      roles: [Role.BILLING_STAFF],
      enabled: true,
    },
  });
  console.log(`[Seed] Created/Verified billing staff: ${billing.username}`);

  console.log('[Seed] Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
