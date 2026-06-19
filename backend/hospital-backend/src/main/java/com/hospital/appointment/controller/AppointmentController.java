package com.hospital.appointment.controller;

import com.hospital.appointment.dto.*;
import com.hospital.appointment.service.AppointmentService;
import com.hospital.common.dto.ApiResponse;
import com.hospital.common.dto.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/appointments") @RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment booking and management")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT', 'DOCTOR')")
    @Operation(summary = "Book Appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(
            @Valid @RequestBody BookAppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked", appointmentService.bookAppointment(request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "List All Appointments")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> getAllAppointments(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAllAppointments(page, size, status)));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get Patient Appointments")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> getPatientAppointments(
            @PathVariable Long patientId, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getPatientAppointments(patientId, page, size)));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    @Operation(summary = "Get Doctor Appointments")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> getDoctorAppointments(
            @PathVariable Long doctorId, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getDoctorAppointments(doctorId, page, size)));
    }

    @GetMapping("/doctor/{doctorId}/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Get Today's Appointments for Doctor")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getTodayAppointments(@PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getTodayAppointments(doctorId)));
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Reschedule Appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> rescheduleAppointment(
            @PathVariable Long id, @RequestBody Map<String, LocalDateTime> body) {
        return ResponseEntity.ok(ApiResponse.success("Appointment rescheduled",
                appointmentService.rescheduleAppointment(id, body.get("newDateTime"))));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT', 'DOCTOR')")
    @Operation(summary = "Cancel Appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(
            @PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled",
                appointmentService.cancelAppointment(id, reason)));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Complete Appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> completeAppointment(
            @PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("consultationNotes") : null;
        return ResponseEntity.ok(ApiResponse.success("Appointment completed",
                appointmentService.completeAppointment(id, notes)));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    @Operation(summary = "Confirm Appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirmAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Appointment confirmed",
                appointmentService.confirmAppointment(id)));
    }
}
