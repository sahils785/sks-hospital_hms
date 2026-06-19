package com.hospital.prescription.service;

import com.hospital.common.dto.PagedResponse;
import com.hospital.common.exception.ResourceNotFoundException;
import com.hospital.prescription.dto.*;
import com.hospital.prescription.entity.Medication;
import com.hospital.prescription.entity.Prescription;
import com.hospital.prescription.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j @Service @RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    @Transactional
    public PrescriptionResponse createPrescription(PrescriptionCreateRequest req) {
        Prescription prescription = Prescription.builder()
                .patientId(req.getPatientId()).patientName(req.getPatientName())
                .doctorId(req.getDoctorId()).doctorName(req.getDoctorName())
                .appointmentId(req.getAppointmentId())
                .diagnosis(req.getDiagnosis()).notes(req.getNotes())
                .build();

        if (req.getMedications() != null) {
            req.getMedications().forEach(m -> prescription.addMedication(Medication.builder()
                    .medicineName(m.getMedicineName()).dosage(m.getDosage())
                    .frequency(m.getFrequency()).duration(m.getDuration())
                    .instructions(m.getInstructions()).build()));
        }

        Prescription saved = prescriptionRepository.save(prescription);
        log.info("Prescription created: {}", saved.getId());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescriptionById(Long id) {
        return toResponse(prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", id)));
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescriptionByAppointmentId(Long appointmentId) {
        return toResponse(prescriptionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "appointmentId", appointmentId)));
    }

    @Transactional(readOnly = true)
    public PagedResponse<PrescriptionResponse> getPatientPrescriptions(Long patientId, int page, int size) {
        Page<Prescription> pPage = prescriptionRepository.findByPatientId(patientId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return toPagedResponse(pPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<PrescriptionResponse> getDoctorPrescriptions(Long doctorId, int page, int size) {
        Page<Prescription> pPage = prescriptionRepository.findByDoctorId(doctorId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return toPagedResponse(pPage);
    }

    private PrescriptionResponse toResponse(Prescription p) {
        return PrescriptionResponse.builder()
                .id(p.getId()).patientId(p.getPatientId()).patientName(p.getPatientName())
                .doctorId(p.getDoctorId()).doctorName(p.getDoctorName())
                .appointmentId(p.getAppointmentId()).diagnosis(p.getDiagnosis())
                .notes(p.getNotes()).createdAt(p.getCreatedAt())
                .medications(p.getMedications().stream().map(m -> MedicationDto.builder()
                        .id(m.getId()).medicineName(m.getMedicineName()).dosage(m.getDosage())
                        .frequency(m.getFrequency()).duration(m.getDuration())
                        .instructions(m.getInstructions()).build()).toList())
                .build();
    }

    private PagedResponse<PrescriptionResponse> toPagedResponse(Page<Prescription> page) {
        return PagedResponse.of(page.getContent().stream().map(this::toResponse).toList(),
                page.getNumber(), page.getSize(), page.getTotalElements(),
                page.getTotalPages(), page.isFirst(), page.isLast());
    }
}
