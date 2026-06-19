package com.hospital.patient.dto;

import com.hospital.patient.entity.Patient;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PatientCreateRequest {
    @NotNull(message = "User ID is required") private Long userId;
    @NotBlank(message = "First name is required") @Size(max = 50) private String firstName;
    @NotBlank(message = "Last name is required") @Size(max = 50) private String lastName;
    @NotBlank(message = "Email is required") @Email private String email;
    @Size(max = 20) private String phone;
    private LocalDate dateOfBirth;
    private Patient.Gender gender;
    private String bloodGroup;
    private String address;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private LocalDate insuranceExpiry;
    private String allergies;
    private List<EmergencyContactDto> emergencyContacts;
}
