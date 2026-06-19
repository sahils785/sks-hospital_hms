package com.hospital.analytics.controller;

import com.hospital.analytics.dto.AnalyticsResponse;
import com.hospital.appointment.entity.Appointment;
import com.hospital.appointment.repository.AppointmentRepository;
import com.hospital.billing.entity.Invoice;
import com.hospital.billing.repository.InvoiceRepository;
import com.hospital.doctor.repository.DoctorRepository;
import com.hospital.patient.repository.PatientRepository;
import com.hospital.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Analytics dashboard operations")
public class AnalyticsController {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'BILLING_STAFF')")
    @Operation(summary = "Get Dashboard Analytics", description = "Fetch stats and metrics for the dashboard")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getDashboardStats() {
        // 1. Compute metrics
        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalAppointments = appointmentRepository.count();
        long completedAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.COMPLETED);
        long pendingInvoices = invoiceRepository.countByStatus(Invoice.InvoiceStatus.PENDING);
        
        BigDecimal rawRevenue = invoiceRepository.sumTotalPaidRevenue();
        double totalRevenue = rawRevenue != null ? rawRevenue.doubleValue() : 0.0;

        AnalyticsResponse.Metrics metrics = AnalyticsResponse.Metrics.builder()
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .totalAppointments(totalAppointments)
                .completedAppointments(completedAppointments)
                .pendingInvoices(pendingInvoices)
                .totalRevenue(totalRevenue)
                .build();

        // 2. Compute charts (revenueHistory)
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(5).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        List<Invoice> paidInvoices = invoiceRepository.findByStatusAndCreatedAtAfter(
                Invoice.InvoiceStatus.PAID, sixMonthsAgo
        );

        String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        LinkedHashMap<String, Double> monthlyRevenueMap = new LinkedHashMap<>();

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            String label = monthNames[ym.getMonthValue() - 1] + " " + String.valueOf(ym.getYear()).substring(2);
            monthlyRevenueMap.put(label, 0.0);
        }

        for (Invoice inv : paidInvoices) {
            if (inv.getCreatedAt() != null) {
                YearMonth ym = YearMonth.from(inv.getCreatedAt());
                String label = monthNames[ym.getMonthValue() - 1] + " " + String.valueOf(ym.getYear()).substring(2);
                if (monthlyRevenueMap.containsKey(label)) {
                    monthlyRevenueMap.put(label, monthlyRevenueMap.get(label) + inv.getFinalAmount().doubleValue());
                }
            }
        }

        List<AnalyticsResponse.MonthlyRevenue> revenueHistory = new ArrayList<>();
        monthlyRevenueMap.forEach((k, v) -> revenueHistory.add(new AnalyticsResponse.MonthlyRevenue(k, v)));

        // 3. Compute charts (appointmentStats)
        long scheduled = appointmentRepository.countByStatus(Appointment.AppointmentStatus.SCHEDULED);
        long completed = appointmentRepository.countByStatus(Appointment.AppointmentStatus.COMPLETED);
        long cancelled = appointmentRepository.countByStatus(Appointment.AppointmentStatus.CANCELLED);
        long rescheduled = appointmentRepository.countByStatus(Appointment.AppointmentStatus.RESCHEDULED);

        AnalyticsResponse.AppointmentStats appointmentStats = AnalyticsResponse.AppointmentStats.builder()
                .scheduled(scheduled)
                .completed(completed)
                .cancelled(cancelled)
                .rescheduled(rescheduled)
                .build();

        AnalyticsResponse.Charts charts = AnalyticsResponse.Charts.builder()
                .revenueHistory(revenueHistory)
                .appointmentStats(appointmentStats)
                .build();

        // 4. Fetch recent appointments
        List<Appointment> recent = appointmentRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "appointmentDateTime"))
        ).getContent();

        List<AnalyticsResponse.RecentAppointmentDto> recentAppointments = recent.stream()
                .map(a -> AnalyticsResponse.RecentAppointmentDto.builder()
                        .id(a.getId())
                        .patientId(a.getPatientId())
                        .patientName(a.getPatientName())
                        .doctorId(a.getDoctorId())
                        .doctorName(a.getDoctorName())
                        .appointmentDateTime(a.getAppointmentDateTime().toString())
                        .status(a.getStatus().name())
                        .reason(a.getReason())
                        .build())
                .collect(Collectors.toList());

        AnalyticsResponse responseBody = AnalyticsResponse.builder()
                .metrics(metrics)
                .charts(charts)
                .recentAppointments(recentAppointments)
                .build();

        return ResponseEntity.ok(ApiResponse.success(responseBody));
    }
}
