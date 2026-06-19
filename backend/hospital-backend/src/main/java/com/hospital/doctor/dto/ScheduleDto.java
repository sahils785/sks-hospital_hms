package com.hospital.doctor.dto;

import lombok.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ScheduleDto {
    private Long id;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private int slotDurationMinutes;
    private int maxPatients;
    private boolean active;
}
