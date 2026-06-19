package com.hospital.patient.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EmergencyContactDto {
    private Long id;
    @NotBlank(message = "Contact name is required") private String name;
    @NotBlank(message = "Relationship is required") private String relationship;
    @NotBlank(message = "Phone is required") private String phone;
    private String email;
}
