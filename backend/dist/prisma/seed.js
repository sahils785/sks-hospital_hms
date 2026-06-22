"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('[Seed] Seeding default SaaS users and profiles...');
    const passwordHash = await bcrypt_1.default.hash('Admin@123', 10);
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
            roles: [client_1.Role.ADMIN],
            enabled: true,
        },
    });
    console.log(`[Seed] Created/Verified admin user: ${admin.username}`);
    // 2. Doctors
    const docSmithUser = await prisma.user.upsert({
        where: { username: 'dr.smith' },
        update: {},
        create: {
            username: 'dr.smith',
            email: 'dr.smith@hospital.com',
            passwordHash,
            firstName: 'John',
            lastName: 'Smith',
            phone: '+1234567891',
            roles: [client_1.Role.DOCTOR],
            enabled: true,
        },
    });
    const docSmithProfile = await prisma.doctor.upsert({
        where: { userId: docSmithUser.id },
        update: {},
        create: {
            userId: docSmithUser.id,
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
    console.log(`[Seed] Created/Verified doctor profile: Dr. ${docSmithProfile.lastName}`);
    const docSinghUser = await prisma.user.upsert({
        where: { username: 'dr.singh' },
        update: {},
        create: {
            username: 'dr.singh',
            email: 'dr.singh@hospital.com',
            passwordHash,
            firstName: 'Rakesh',
            lastName: 'Singh',
            phone: '9831122334',
            roles: [client_1.Role.DOCTOR],
            enabled: true,
        },
    });
    const docSinghProfile = await prisma.doctor.upsert({
        where: { userId: docSinghUser.id },
        update: {},
        create: {
            userId: docSinghUser.id,
            firstName: 'Rakesh',
            lastName: 'Singh',
            email: 'dr.singh@hospital.com',
            phone: '9831122334',
            specialization: 'Cardiology',
            licenseNumber: 'MD12346',
            department: 'Heart Center',
            experienceYears: 15,
            consultationFee: 200.00,
            bio: 'Renowned cardiologist with extensive experience in invasive and non-invasive cardiovascular medicine.',
            available: true,
            schedules: {
                create: [
                    { dayOfWeek: 'TUESDAY', startTime: '10:00', endTime: '18:00' },
                    { dayOfWeek: 'THURSDAY', startTime: '10:00', endTime: '18:00' },
                ],
            },
        },
    });
    console.log(`[Seed] Created/Verified doctor profile: Dr. ${docSinghProfile.lastName}`);
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
            roles: [client_1.Role.RECEPTIONIST],
            enabled: true,
        },
    });
    console.log(`[Seed] Created/Verified receptionist: ${receptionist.username}`);
    // 4. Patients
    const patient1User = await prisma.user.upsert({
        where: { username: 'patient1' },
        update: {},
        create: {
            username: 'patient1',
            email: 'patient@hospital.com',
            passwordHash,
            firstName: 'Jane',
            lastName: 'Doe',
            phone: '+1234567893',
            roles: [client_1.Role.PATIENT],
            enabled: true,
        },
    });
    const patient1Profile = await prisma.patient.upsert({
        where: { userId: patient1User.id },
        update: {},
        create: {
            userId: patient1User.id,
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'patient@hospital.com',
            phone: '+1234567893',
            dateOfBirth: new Date('1990-05-15'),
            gender: client_1.Gender.FEMALE,
            bloodGroup: 'O+',
            address: '123 Main St, New York, NY',
            insuranceProvider: 'BlueCross Health',
            insurancePolicyNumber: 'POL-77382-99',
            insuranceExpiry: new Date('2028-12-31'),
            allergies: 'Penicillin, Peanuts',
        },
    });
    console.log(`[Seed] Created/Verified patient profile: ${patient1Profile.firstName} ${patient1Profile.lastName}`);
    const patient2User = await prisma.user.upsert({
        where: { username: 'patient2' },
        update: {},
        create: {
            username: 'patient2',
            email: 'rahul@hospital.com',
            passwordHash,
            firstName: 'Rahul',
            lastName: 'Sharma',
            phone: '9830012345',
            roles: [client_1.Role.PATIENT],
            enabled: true,
        },
    });
    const patient2Profile = await prisma.patient.upsert({
        where: { userId: patient2User.id },
        update: {},
        create: {
            userId: patient2User.id,
            firstName: 'Rahul',
            lastName: 'Sharma',
            email: 'rahul@hospital.com',
            phone: '9830012345',
            dateOfBirth: new Date('1988-08-20'),
            gender: client_1.Gender.MALE,
            bloodGroup: 'O+',
            address: 'Sector 5, Salt Lake, Kolkata',
            insuranceProvider: 'Star Health',
            insurancePolicyNumber: 'POL-55221-11',
            insuranceExpiry: new Date('2027-05-10'),
        },
    });
    console.log(`[Seed] Created/Verified patient profile: ${patient2Profile.firstName} ${patient2Profile.lastName}`);
    const patient3User = await prisma.user.upsert({
        where: { username: 'patient3' },
        update: {},
        create: {
            username: 'patient3',
            email: 'priya@hospital.com',
            passwordHash,
            firstName: 'Priya',
            lastName: 'Patel',
            phone: '9830054321',
            roles: [client_1.Role.PATIENT],
            enabled: true,
        },
    });
    const patient3Profile = await prisma.patient.upsert({
        where: { userId: patient3User.id },
        update: {},
        create: {
            userId: patient3User.id,
            firstName: 'Priya',
            lastName: 'Patel',
            email: 'priya@hospital.com',
            phone: '9830054321',
            dateOfBirth: new Date('1992-12-05'),
            gender: client_1.Gender.FEMALE,
            bloodGroup: 'A-',
            address: 'Ghatkopar, Mumbai',
            insuranceProvider: 'HDFC Ergo',
            insurancePolicyNumber: 'POL-33221-00',
            insuranceExpiry: new Date('2029-01-15'),
        },
    });
    console.log(`[Seed] Created/Verified patient profile: ${patient3Profile.firstName} ${patient3Profile.lastName}`);
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
            roles: [client_1.Role.BILLING_STAFF],
            enabled: true,
        },
    });
    console.log(`[Seed] Created/Verified billing staff: ${billing.username}`);
    // 6. Appointments
    const apt1 = await prisma.appointment.create({
        data: {
            patientId: patient1Profile.id,
            patientName: `${patient1Profile.firstName} ${patient1Profile.lastName}`,
            patientEmail: patient1Profile.email,
            doctorId: docSmithProfile.id,
            doctorName: `Dr. ${docSmithProfile.firstName} ${docSmithProfile.lastName}`,
            appointmentDateTime: new Date('2026-06-20T10:00:00Z'),
            status: client_1.AppointmentStatus.SCHEDULED,
            reason: 'Hypertension checkup',
        },
    });
    const apt2 = await prisma.appointment.create({
        data: {
            patientId: patient2Profile.id,
            patientName: `${patient2Profile.firstName} ${patient2Profile.lastName}`,
            patientEmail: patient2Profile.email,
            doctorId: docSinghProfile.id,
            doctorName: `Dr. ${docSinghProfile.firstName} ${docSinghProfile.lastName}`,
            appointmentDateTime: new Date('2026-06-20T11:00:00Z'),
            status: client_1.AppointmentStatus.SCHEDULED,
            reason: 'Routine Checkup',
        },
    });
    const apt3 = await prisma.appointment.create({
        data: {
            patientId: patient3Profile.id,
            patientName: `${patient3Profile.firstName} ${patient3Profile.lastName}`,
            patientEmail: patient3Profile.email,
            doctorId: docSmithProfile.id,
            doctorName: `Dr. ${docSmithProfile.firstName} ${docSmithProfile.lastName}`,
            appointmentDateTime: new Date('2026-06-15T09:30:00Z'),
            status: client_1.AppointmentStatus.COMPLETED,
            reason: 'General checkup',
            consultationNotes: 'Patient has mild hypertension. Prescribed standard beta-blockers.',
        },
    });
    const apt4 = await prisma.appointment.create({
        data: {
            patientId: patient1Profile.id,
            patientName: `${patient1Profile.firstName} ${patient1Profile.lastName}`,
            patientEmail: patient1Profile.email,
            doctorId: docSinghProfile.id,
            doctorName: `Dr. ${docSinghProfile.firstName} ${docSinghProfile.lastName}`,
            appointmentDateTime: new Date('2026-06-16T14:00:00Z'),
            status: client_1.AppointmentStatus.CANCELLED,
            reason: 'Follow-up consultation',
            cancellationReason: 'Patient requested rescheduling.',
        },
    });
    console.log('[Seed] Seeding appointments complete!');
    // 7. Prescriptions
    const pres1 = await prisma.prescription.create({
        data: {
            patientId: patient3Profile.id,
            patientName: `${patient3Profile.firstName} ${patient3Profile.lastName}`,
            doctorId: docSmithProfile.id,
            doctorName: `Dr. ${docSmithProfile.firstName} ${docSmithProfile.lastName}`,
            appointmentId: apt3.id,
            diagnosis: 'Hypertension',
            notes: 'Maintain low salt diet and regular daily cardio exercise for 30 minutes.',
            medications: {
                create: [
                    {
                        medicineName: 'Amlodipine',
                        dosage: '5mg',
                        frequency: 'Once a day',
                        duration: '30 days',
                        instructions: 'Take in the morning after breakfast.',
                    },
                    {
                        medicineName: 'Lisinopril',
                        dosage: '10mg',
                        frequency: 'Once a day',
                        duration: '30 days',
                        instructions: 'Take in the evening before dinner.',
                    },
                ],
            },
        },
    });
    console.log('[Seed] Seeding prescriptions complete!');
    // 8. Invoices & Payments
    const invoice1 = await prisma.invoice.create({
        data: {
            patientId: patient3Profile.id,
            patientName: `${patient3Profile.firstName} ${patient3Profile.lastName}`,
            patientEmail: patient3Profile.email,
            appointmentId: apt3.id,
            totalAmount: 150.00,
            discount: 0.00,
            tax: 0.00,
            finalAmount: 150.00,
            status: client_1.InvoiceStatus.PAID,
            description: `Consultation fee for Dr. ${docSmithProfile.firstName} ${docSmithProfile.lastName}`,
            payments: {
                create: [
                    {
                        amount: 150.00,
                        paymentMethod: client_1.PaymentMethod.CARD,
                        transactionId: 'TXN-998877',
                        status: client_1.PaymentStatus.SUCCESS,
                        paidAt: new Date('2026-06-15T10:00:00Z'),
                    },
                ],
            },
        },
    });
    const invoice2 = await prisma.invoice.create({
        data: {
            patientId: patient1Profile.id,
            patientName: `${patient1Profile.firstName} ${patient1Profile.lastName}`,
            patientEmail: patient1Profile.email,
            appointmentId: apt1.id,
            totalAmount: 150.00,
            discount: 0.00,
            tax: 0.00,
            finalAmount: 150.00,
            status: client_1.InvoiceStatus.PENDING,
            description: `Consultation fee for Dr. ${docSmithProfile.firstName} ${docSmithProfile.lastName}`,
        },
    });
    const invoice3 = await prisma.invoice.create({
        data: {
            patientId: patient2Profile.id,
            patientName: `${patient2Profile.firstName} ${patient2Profile.lastName}`,
            patientEmail: patient2Profile.email,
            appointmentId: apt2.id,
            totalAmount: 200.00,
            discount: 15.00,
            tax: 0.00,
            finalAmount: 185.00,
            status: client_1.InvoiceStatus.PENDING,
            description: `Consultation fee for Dr. ${docSinghProfile.firstName} ${docSinghProfile.lastName}`,
        },
    });
    console.log('[Seed] Seeding billing invoices and payments complete!');
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
