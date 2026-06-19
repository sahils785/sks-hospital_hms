package com.hospital.prescription.repository;

import com.hospital.prescription.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Page<Prescription> findByPatientId(Long patientId, Pageable pageable);
    Page<Prescription> findByDoctorId(Long doctorId, Pageable pageable);
    Optional<Prescription> findByAppointmentId(Long appointmentId);
}
