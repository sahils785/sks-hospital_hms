package com.hospital.prescription.controller;

import com.hospital.common.dto.ApiResponse;
import com.hospital.common.dto.PagedResponse;
import com.hospital.prescription.dto.*;
import com.hospital.prescription.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/prescriptions") @RequiredArgsConstructor
@Tag(name = "Prescriptions", description = "Prescription management")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Create Prescription")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> createPrescription(
            @Valid @RequestBody PrescriptionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Prescription created", prescriptionService.createPrescription(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PHARMACIST', 'PATIENT')")
    @Operation(summary = "Get Prescription")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> getPrescription(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(prescriptionService.getPrescriptionById(id)));
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PHARMACIST', 'PATIENT')")
    @Operation(summary = "Get Prescription by Appointment")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> getPrescriptionByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.success(prescriptionService.getPrescriptionByAppointmentId(appointmentId)));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PHARMACIST', 'PATIENT')")
    @Operation(summary = "Get Patient Prescriptions")
    public ResponseEntity<ApiResponse<PagedResponse<PrescriptionResponse>>> getPatientPrescriptions(
            @PathVariable Long patientId, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(prescriptionService.getPatientPrescriptions(patientId, page, size)));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Get Doctor Prescriptions")
    public ResponseEntity<ApiResponse<PagedResponse<PrescriptionResponse>>> getDoctorPrescriptions(
            @PathVariable Long doctorId, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(prescriptionService.getDoctorPrescriptions(doctorId, page, size)));
    }
}
