package com.hospital.prescription.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PrescriptionCreateRequest {
    @NotNull private Long patientId;
    @NotBlank private String patientName;
    @NotNull private Long doctorId;
    @NotBlank private String doctorName;
    private Long appointmentId;
    private String diagnosis;
    private String notes;

    @NotEmpty(message = "At least one medication is required")
    private List<MedicationDto> medications;
}
