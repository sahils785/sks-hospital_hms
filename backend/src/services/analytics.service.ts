import prisma from '../config/db';
import { Decimal } from '@prisma/client/runtime/library';

export const getDashboardStats = async () => {
  const [patientsCount, doctorsCount, appointmentsCount, completedCount, pendingInvoices] =
    await prisma.$transaction([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.invoice.count({ where: { status: 'PENDING' } }),
    ]);

  // Total Paid Revenue
  const paidInvoices = await prisma.invoice.findMany({
    where: { status: 'PAID' },
    select: { finalAmount: true },
  });

  const totalRevenue = paidInvoices.reduce(
    (sum, inv) => sum.plus(new Decimal(inv.finalAmount)),
    new Decimal(0)
  );

  // Group monthly revenues for the last 6 months
  const allPaidInvoices = await prisma.invoice.findMany({
    where: {
      status: 'PAID',
      createdAt: {
        gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000), // last 6 months
      },
    },
    select: {
      finalAmount: true,
      createdAt: true,
    },
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyRevenueMap: { [month: string]: number } = {};

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mLabel = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    monthlyRevenueMap[mLabel] = 0;
  }

  allPaidInvoices.forEach((inv) => {
    const date = new Date(inv.createdAt);
    const mLabel = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
    if (monthlyRevenueMap[mLabel] !== undefined) {
      monthlyRevenueMap[mLabel] += Number(inv.finalAmount);
    }
  });

  const revenueChartData = Object.keys(monthlyRevenueMap).map((key) => ({
    month: key,
    revenue: monthlyRevenueMap[key],
  }));

  // Appointments Status counts
  const appts = await prisma.appointment.findMany({
    select: { status: true },
  });

  const appointmentStats = {
    scheduled: appts.filter((a) => a.status === 'SCHEDULED').length,
    completed: appts.filter((a) => a.status === 'COMPLETED').length,
    cancelled: appts.filter((a) => a.status === 'CANCELLED').length,
    rescheduled: appts.filter((a) => a.status === 'RESCHEDULED').length,
  };

  // Recent Appointments
  const recentAppointments = await prisma.appointment.findMany({
    take: 5,
    orderBy: { appointmentDateTime: 'desc' },
  });

  return {
    metrics: {
      totalPatients: patientsCount,
      totalDoctors: doctorsCount,
      totalAppointments: appointmentsCount,
      completedAppointments: completedCount,
      pendingInvoices,
      totalRevenue: Number(totalRevenue),
    },
    charts: {
      revenueHistory: revenueChartData,
      appointmentStats,
    },
    recentAppointments,
  };
};
