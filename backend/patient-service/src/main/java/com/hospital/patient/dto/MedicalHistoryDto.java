package com.hospital.patient.dto;

import com.hospital.patient.entity.MedicalHistory;
import lombok.*;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MedicalHistoryDto {
    private Long id;
    private String conditionName;
    private String description;
    private LocalDate diagnosedDate;
    private MedicalHistory.Status status;
    private String treatment;
    private String notes;
}
