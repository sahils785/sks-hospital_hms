package com.hospital.doctor.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AvailabilityResponse {
    private Long doctorId;
    private String doctorName;
    private String specialization;
    private java.time.LocalDate date;
    private List<TimeSlot> availableSlots;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TimeSlot {
        private LocalTime startTime;
        private LocalTime endTime;
        private boolean available;
    }
}
