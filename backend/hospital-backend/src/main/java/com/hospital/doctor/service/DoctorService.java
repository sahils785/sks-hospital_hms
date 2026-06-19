package com.hospital.doctor.service;

import com.hospital.common.dto.PagedResponse;
import com.hospital.common.exception.BusinessException;
import com.hospital.common.exception.ResourceNotFoundException;
import com.hospital.doctor.dto.*;
import com.hospital.doctor.entity.Doctor;
import com.hospital.doctor.entity.DoctorSchedule;
import com.hospital.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j @Service @RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    @Transactional
    public DoctorResponse createDoctor(DoctorCreateRequest req) {
        if (doctorRepository.existsByUserId(req.getUserId()))
            throw new BusinessException("DOCTOR_EXISTS", "Doctor profile already exists");
        if (doctorRepository.existsByLicenseNumber(req.getLicenseNumber()))
            throw new BusinessException("LICENSE_EXISTS", "License number already registered");

        Doctor doctor = Doctor.builder()
                .userId(req.getUserId()).firstName(req.getFirstName()).lastName(req.getLastName())
                .email(req.getEmail()).phone(req.getPhone()).specialization(req.getSpecialization())
                .licenseNumber(req.getLicenseNumber()).qualification(req.getQualification())
                .experienceYears(req.getExperienceYears()).consultationFee(req.getConsultationFee())
                .department(req.getDepartment()).bio(req.getBio()).available(true).build();

        if (req.getSchedules() != null) {
            req.getSchedules().forEach(s -> doctor.addSchedule(DoctorSchedule.builder()
                    .dayOfWeek(s.getDayOfWeek()).startTime(s.getStartTime()).endTime(s.getEndTime())
                    .slotDurationMinutes(s.getSlotDurationMinutes() > 0 ? s.getSlotDurationMinutes() : 30)
                    .maxPatients(s.getMaxPatients() > 0 ? s.getMaxPatients() : 20).active(true).build()));
        }

        Doctor saved = doctorRepository.save(doctor);
        log.info("Doctor created: {} — {} ({})", saved.getId(), saved.getFirstName() + " " + saved.getLastName(), saved.getSpecialization());
        return toResponse(saved);
    }

    @Cacheable(value = "doctors", key = "#id")
    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(Long id) {
        return toResponse(doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id)));
    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorByUserId(Long userId) {
        return toResponse(doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", userId)));
    }

    @Transactional(readOnly = true)
    public PagedResponse<DoctorResponse> getAllDoctors(int page, int size, String search, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, sortBy));
        Page<Doctor> doctorPage = (search != null && !search.isBlank())
                ? doctorRepository.searchDoctors(search, pageable)
                : doctorRepository.findByAvailableTrue(pageable);

        List<DoctorResponse> doctors = doctorPage.getContent().stream().map(this::toResponse).toList();
        return PagedResponse.of(doctors, doctorPage.getNumber(), doctorPage.getSize(),
                doctorPage.getTotalElements(), doctorPage.getTotalPages(), doctorPage.isFirst(), doctorPage.isLast());
    }

    @CacheEvict(value = "doctors", key = "#id")
    @Transactional
    public DoctorResponse updateDoctor(Long id, DoctorCreateRequest req) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        doctor.setFirstName(req.getFirstName()); doctor.setLastName(req.getLastName());
        doctor.setEmail(req.getEmail()); doctor.setPhone(req.getPhone());
        doctor.setSpecialization(req.getSpecialization()); doctor.setQualification(req.getQualification());
        doctor.setExperienceYears(req.getExperienceYears()); doctor.setConsultationFee(req.getConsultationFee());
        doctor.setDepartment(req.getDepartment()); doctor.setBio(req.getBio());
        return toResponse(doctorRepository.save(doctor));
    }

    /**
     * Get available time slots for a doctor on a specific date.
     */
    @Transactional(readOnly = true)
    public AvailabilityResponse getAvailability(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        DayOfWeek dayOfWeek = date.getDayOfWeek();
        List<AvailabilityResponse.TimeSlot> slots = new ArrayList<>();

        doctor.getSchedules().stream()
                .filter(s -> s.getDayOfWeek() == dayOfWeek && s.isActive())
                .forEach(schedule -> {
                    LocalTime current = schedule.getStartTime();
                    while (current.plusMinutes(schedule.getSlotDurationMinutes()).isBefore(schedule.getEndTime())
                            || current.plusMinutes(schedule.getSlotDurationMinutes()).equals(schedule.getEndTime())) {
                        slots.add(AvailabilityResponse.TimeSlot.builder()
                                .startTime(current)
                                .endTime(current.plusMinutes(schedule.getSlotDurationMinutes()))
                                .available(true) // Will be refined when appointment service checks bookings
                                .build());
                        current = current.plusMinutes(schedule.getSlotDurationMinutes());
                    }
                });

        return AvailabilityResponse.builder()
                .doctorId(doctorId)
                .doctorName(doctor.getFirstName() + " " + doctor.getLastName())
                .specialization(doctor.getSpecialization())
                .date(date)
                .availableSlots(slots)
                .build();
    }

    @Transactional(readOnly = true)
    public List<String> getAllSpecializations() {
        return doctorRepository.findAllSpecializations();
    }

    @Transactional(readOnly = true)
    public List<String> getAllDepartments() {
        return doctorRepository.findAllDepartments();
    }

    private DoctorResponse toResponse(Doctor d) {
        return DoctorResponse.builder()
                .id(d.getId()).userId(d.getUserId())
                .firstName(d.getFirstName()).lastName(d.getLastName())
                .email(d.getEmail()).phone(d.getPhone())
                .specialization(d.getSpecialization()).licenseNumber(d.getLicenseNumber())
                .qualification(d.getQualification()).experienceYears(d.getExperienceYears())
                .consultationFee(d.getConsultationFee()).department(d.getDepartment())
                .bio(d.getBio()).available(d.isAvailable()).createdAt(d.getCreatedAt())
                .schedules(d.getSchedules().stream().map(s -> ScheduleDto.builder()
                        .id(s.getId()).dayOfWeek(s.getDayOfWeek()).startTime(s.getStartTime())
                        .endTime(s.getEndTime()).slotDurationMinutes(s.getSlotDurationMinutes())
                        .maxPatients(s.getMaxPatients()).active(s.isActive()).build()).toList())
                .build();
    }
}
