"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const db_1 = __importDefault(require("../config/db"));
const library_1 = require("@prisma/client/runtime/library");
const getDashboardStats = async () => {
    const [patientsCount, doctorsCount, appointmentsCount, completedCount, pendingInvoices] = await db_1.default.$transaction([
        db_1.default.patient.count(),
        db_1.default.doctor.count(),
        db_1.default.appointment.count(),
        db_1.default.appointment.count({ where: { status: 'COMPLETED' } }),
        db_1.default.invoice.count({ where: { status: 'PENDING' } }),
    ]);
    // Total Paid Revenue
    const paidInvoices = await db_1.default.invoice.findMany({
        where: { status: 'PAID' },
        select: { finalAmount: true },
    });
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum.plus(new library_1.Decimal(inv.finalAmount)), new library_1.Decimal(0));
    // Group monthly revenues for the last 6 months
    const allPaidInvoices = await db_1.default.invoice.findMany({
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
    const monthlyRevenueMap = {};
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
    const appts = await db_1.default.appointment.findMany({
        select: { status: true },
    });
    const appointmentStats = {
        scheduled: appts.filter((a) => a.status === 'SCHEDULED').length,
        completed: appts.filter((a) => a.status === 'COMPLETED').length,
        cancelled: appts.filter((a) => a.status === 'CANCELLED').length,
        rescheduled: appts.filter((a) => a.status === 'RESCHEDULED').length,
    };
    // Recent Appointments
    const recentAppointments = await db_1.default.appointment.findMany({
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
exports.getDashboardStats = getDashboardStats;
