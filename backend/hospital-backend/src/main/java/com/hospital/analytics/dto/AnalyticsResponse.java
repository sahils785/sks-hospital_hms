package com.hospital.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private Metrics metrics;
    private Charts charts;
    private List<RecentAppointmentDto> recentAppointments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Metrics {
        private long totalPatients;
        private long totalDoctors;
        private long totalAppointments;
        private long completedAppointments;
        private long pendingInvoices;
        private double totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Charts {
        private List<MonthlyRevenue> revenueHistory;
        private AppointmentStats appointmentStats;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private String month;
        private double revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppointmentStats {
        private long scheduled;
        private long completed;
        private long cancelled;
        private long rescheduled;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentAppointmentDto {
        private Long id;
        private Long patientId;
        private String patientName;
        private Long doctorId;
        private String doctorName;
        private String appointmentDateTime;
        private String status;
        private String reason;
    }
}
