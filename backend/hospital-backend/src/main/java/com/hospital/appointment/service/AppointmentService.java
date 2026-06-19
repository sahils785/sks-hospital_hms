package com.hospital.appointment.service;

import com.hospital.appointment.dto.*;
import com.hospital.appointment.entity.Appointment;
import com.hospital.appointment.entity.Appointment.AppointmentStatus;
import com.hospital.appointment.repository.AppointmentRepository;
import com.hospital.common.dto.PagedResponse;
import com.hospital.common.event.AppointmentEvent;
import com.hospital.common.exception.BusinessException;
import com.hospital.common.exception.ResourceNotFoundException;
import com.hospital.common.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j @Service @RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public AppointmentResponse bookAppointment(BookAppointmentRequest req) {
        int duration = req.getDurationMinutes() != null ? req.getDurationMinutes() : 30;
        LocalDateTime endTime = req.getAppointmentDateTime().plusMinutes(duration);

        // Check for conflicts
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                req.getDoctorId(), req.getAppointmentDateTime(), endTime);
        if (!conflicts.isEmpty()) {
            throw new BusinessException("SLOT_UNAVAILABLE", "The selected time slot is not available");
        }

        Appointment appointment = Appointment.builder()
                .patientId(req.getPatientId()).patientName(req.getPatientName()).patientEmail(req.getPatientEmail())
                .doctorId(req.getDoctorId()).doctorName(req.getDoctorName())
                .appointmentDateTime(req.getAppointmentDateTime()).endDateTime(endTime)
                .status(AppointmentStatus.SCHEDULED).reason(req.getReason()).build();

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Appointment booked: {} - Patient {} with Doctor {} at {}",
                saved.getId(), saved.getPatientId(), saved.getDoctorId(), saved.getAppointmentDateTime());

        publishEvent(saved, AppointmentEvent.EventType.CREATED);
        return toResponse(saved);
    }

    @Transactional
    public AppointmentResponse rescheduleAppointment(Long id, LocalDateTime newDateTime) {
        Appointment apt = getAppointment(id);
        if (apt.getStatus() == AppointmentStatus.COMPLETED || apt.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BusinessException("INVALID_STATE", "Cannot reschedule a " + apt.getStatus() + " appointment");
        }

        long durationMinutes = java.time.Duration.between(apt.getAppointmentDateTime(), apt.getEndDateTime()).toMinutes();
        LocalDateTime newEndTime = newDateTime.plusMinutes(durationMinutes);

        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                apt.getDoctorId(), newDateTime, newEndTime);
        conflicts.removeIf(a -> a.getId().equals(id)); // Exclude current appointment
        if (!conflicts.isEmpty()) {
            throw new BusinessException("SLOT_UNAVAILABLE", "The new time slot is not available");
        }

        apt.setAppointmentDateTime(newDateTime);
        apt.setEndDateTime(newEndTime);
        apt.setStatus(AppointmentStatus.RESCHEDULED);
        Appointment saved = appointmentRepository.save(apt);

        publishEvent(saved, AppointmentEvent.EventType.RESCHEDULED);
        return toResponse(saved);
    }

    @Transactional
    public AppointmentResponse cancelAppointment(Long id, String reason) {
        Appointment apt = getAppointment(id);
        if (apt.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BusinessException("INVALID_STATE", "Cannot cancel a completed appointment");
        }

        apt.setStatus(AppointmentStatus.CANCELLED);
        apt.setCancellationReason(reason);
        Appointment saved = appointmentRepository.save(apt);

        publishEvent(saved, AppointmentEvent.EventType.CANCELLED);
        return toResponse(saved);
    }

    @Transactional
    public AppointmentResponse completeAppointment(Long id, String consultationNotes) {
        Appointment apt = getAppointment(id);
        apt.setStatus(AppointmentStatus.COMPLETED);
        apt.setConsultationNotes(consultationNotes);
        Appointment saved = appointmentRepository.save(apt);

        publishEvent(saved, AppointmentEvent.EventType.COMPLETED);
        return toResponse(saved);
    }

    @Transactional
    public AppointmentResponse confirmAppointment(Long id) {
        Appointment apt = getAppointment(id);
        apt.setStatus(AppointmentStatus.CONFIRMED);
        return toResponse(appointmentRepository.save(apt));
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long id) {
        return toResponse(getAppointment(id));
    }

    @Transactional(readOnly = true)
    public PagedResponse<AppointmentResponse> getPatientAppointments(Long patientId, int page, int size) {
        Page<Appointment> aptPage = appointmentRepository.findByPatientId(patientId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appointmentDateTime")));
        return toPagedResponse(aptPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AppointmentResponse> getDoctorAppointments(Long doctorId, int page, int size) {
        Page<Appointment> aptPage = appointmentRepository.findByDoctorId(doctorId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appointmentDateTime")));
        return toPagedResponse(aptPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AppointmentResponse> getAllAppointments(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appointmentDateTime"));
        Page<Appointment> aptPage;
        if (status != null && !status.isBlank()) {
            aptPage = appointmentRepository.findByStatus(AppointmentStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            aptPage = appointmentRepository.findAll(pageable);
        }
        return toPagedResponse(aptPage);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getTodayAppointments(Long doctorId) {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime tomorrow = today.plusDays(1);
        return appointmentRepository.findDoctorAppointmentsForDate(doctorId, today, tomorrow)
                .stream().map(this::toResponse).toList();
    }

    // ===== Helpers =====

    private Appointment getAppointment(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
    }

    private void publishEvent(Appointment apt, AppointmentEvent.EventType type) {
        try {
            AppointmentEvent event = AppointmentEvent.builder()
                    .appointmentId(apt.getId()).patientId(apt.getPatientId())
                    .doctorId(apt.getDoctorId()).patientName(apt.getPatientName())
                    .patientEmail(apt.getPatientEmail()).doctorName(apt.getDoctorName())
                    .appointmentDateTime(apt.getAppointmentDateTime())
                    .status(apt.getStatus().name()).eventType(type)
                    .reason(apt.getReason()).timestamp(LocalDateTime.now()).build();
            eventPublisher.publishEvent(event);
        } catch (Exception ex) {
            log.error("Failed to publish appointment event: {}", ex.getMessage());
        }
    }

    private AppointmentResponse toResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getId()).patientId(a.getPatientId()).patientName(a.getPatientName())
                .patientEmail(a.getPatientEmail()).doctorId(a.getDoctorId()).doctorName(a.getDoctorName())
                .appointmentDateTime(a.getAppointmentDateTime()).endDateTime(a.getEndDateTime())
                .status(a.getStatus()).reason(a.getReason())
                .consultationNotes(a.getConsultationNotes()).cancellationReason(a.getCancellationReason())
                .createdAt(a.getCreatedAt()).updatedAt(a.getUpdatedAt()).build();
    }

    private PagedResponse<AppointmentResponse> toPagedResponse(Page<Appointment> page) {
        return PagedResponse.of(page.getContent().stream().map(this::toResponse).toList(),
                page.getNumber(), page.getSize(), page.getTotalElements(),
                page.getTotalPages(), page.isFirst(), page.isLast());
    }
}
