package com.hospital.patient.controller;

import com.hospital.common.dto.ApiResponse;
import com.hospital.common.dto.PagedResponse;
import com.hospital.patient.dto.*;
import com.hospital.patient.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Tag(name = "Patients", description = "Patient management operations")
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Register Patient", description = "Create a new patient profile")
    public ResponseEntity<ApiResponse<PatientResponse>> createPatient(
            @Valid @RequestBody PatientCreateRequest request) {
        PatientResponse patient = patientService.createPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient registered", patient));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get Patient", description = "Get patient details by ID")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatient(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientById(id)));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get Patient by User ID", description = "Get patient profile by user ID")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatientByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientByUserId(userId)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    @Operation(summary = "List Patients", description = "Get paginated list of patients")
    public ResponseEntity<ApiResponse<PagedResponse<PatientResponse>>> getAllPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        return ResponseEntity.ok(ApiResponse.success(
                patientService.getAllPatients(page, size, search, sortBy)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Update Patient", description = "Update patient information")
    public ResponseEntity<ApiResponse<PatientResponse>> updatePatient(
            @PathVariable Long id, @Valid @RequestBody PatientCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Patient updated",
                patientService.updatePatient(id, request)));
    }

    @PostMapping("/{id}/medical-history")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Add Medical History", description = "Add medical history record")
    public ResponseEntity<ApiResponse<MedicalHistoryDto>> addMedicalHistory(
            @PathVariable Long id, @Valid @RequestBody MedicalHistoryDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Medical history added",
                        patientService.addMedicalHistory(id, dto)));
    }

    @PostMapping("/{id}/emergency-contacts")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Add Emergency Contact", description = "Add emergency contact")
    public ResponseEntity<ApiResponse<EmergencyContactDto>> addEmergencyContact(
            @PathVariable Long id, @Valid @RequestBody EmergencyContactDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Emergency contact added",
                        patientService.addEmergencyContact(id, dto)));
    }
}
