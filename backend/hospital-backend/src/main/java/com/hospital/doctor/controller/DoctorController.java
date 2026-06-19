package com.hospital.doctor.controller;

import com.hospital.common.dto.ApiResponse;
import com.hospital.common.dto.PagedResponse;
import com.hospital.doctor.dto.*;
import com.hospital.doctor.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "Doctor management and availability")
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create Doctor Profile")
    public ResponseEntity<ApiResponse<DoctorResponse>> createDoctor(@Valid @RequestBody DoctorCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Doctor registered", doctorService.createDoctor(request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Doctor by ID")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorById(id)));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get Doctor by User ID")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorByUserId(userId)));
    }

    @GetMapping
    @Operation(summary = "List Doctors")
    public ResponseEntity<ApiResponse<PagedResponse<DoctorResponse>>> getAllDoctors(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search, @RequestParam(defaultValue = "firstName") String sortBy) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllDoctors(page, size, search, sortBy)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Update Doctor Profile")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateDoctor(
            @PathVariable Long id, @Valid @RequestBody DoctorCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Doctor updated", doctorService.updateDoctor(id, request)));
    }

    @GetMapping("/{id}/availability")
    @Operation(summary = "Get Doctor Availability", description = "Get available time slots for a specific date")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> getAvailability(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAvailability(id, date)));
    }

    @GetMapping("/specializations")
    @Operation(summary = "List All Specializations")
    public ResponseEntity<ApiResponse<List<String>>> getSpecializations() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllSpecializations()));
    }

    @GetMapping("/departments")
    @Operation(summary = "List All Departments")
    public ResponseEntity<ApiResponse<List<String>>> getDepartments() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllDepartments()));
    }
}
