package com.hospital.appointment.repository;

import com.hospital.appointment.entity.Appointment;
import com.hospital.appointment.entity.Appointment.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);
    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);
    Page<Appointment> findByStatus(AppointmentStatus status, Pageable pageable);

    List<Appointment> findByDoctorIdAndAppointmentDateTimeBetweenAndStatusNot(
            Long doctorId, LocalDateTime start, LocalDateTime end, AppointmentStatus excludeStatus);

    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId AND " +
            "DATE(a.appointmentDateTime) = DATE(:date) AND a.status != 'CANCELLED'")
    List<Appointment> findDoctorAppointmentsForDate(
            @Param("doctorId") Long doctorId, @Param("date") LocalDateTime date);

    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId AND " +
            "a.appointmentDateTime BETWEEN :start AND :end AND a.status IN ('SCHEDULED', 'CONFIRMED')")
    List<Appointment> findConflictingAppointments(
            @Param("doctorId") Long doctorId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDateTime BETWEEN :start AND :end " +
            "AND a.status = 'SCHEDULED'")
    List<Appointment> findUpcomingAppointments(
            @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctorId = :doctorId AND " +
            "DATE(a.appointmentDateTime) = CURRENT_DATE AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
    long countTodayAppointments(@Param("doctorId") Long doctorId);
}
