package com.hospital.prescription.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MedicationDto {
    private Long id;
    @NotBlank private String medicineName;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
}
