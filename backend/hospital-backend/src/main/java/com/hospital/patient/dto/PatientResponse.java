package com.hospital.patient.dto;

import com.hospital.patient.entity.Patient;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PatientResponse {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private Patient.Gender gender;
    private String bloodGroup;
    private String address;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private LocalDate insuranceExpiry;
    private String allergies;
    private List<MedicalHistoryDto> medicalHistories;
    private List<EmergencyContactDto> emergencyContacts;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
