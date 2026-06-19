package com.hospital.patient.service;

import com.hospital.common.dto.PagedResponse;
import com.hospital.common.exception.BusinessException;
import com.hospital.common.exception.ResourceNotFoundException;
import com.hospital.patient.dto.*;
import com.hospital.patient.entity.*;
import com.hospital.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    @Transactional
    public PatientResponse createPatient(PatientCreateRequest request) {
        if (patientRepository.existsByUserId(request.getUserId())) {
            throw new BusinessException("PATIENT_EXISTS", "Patient profile already exists for this user");
        }

        Patient patient = Patient.builder()
                .userId(request.getUserId())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .bloodGroup(request.getBloodGroup())
                .address(request.getAddress())
                .insuranceProvider(request.getInsuranceProvider())
                .insurancePolicyNumber(request.getInsurancePolicyNumber())
                .insuranceExpiry(request.getInsuranceExpiry())
                .allergies(request.getAllergies())
                .build();

        if (request.getEmergencyContacts() != null) {
            request.getEmergencyContacts().forEach(ec ->
                    patient.addEmergencyContact(EmergencyContact.builder()
                            .name(ec.getName())
                            .relationship(ec.getRelationship())
                            .phone(ec.getPhone())
                            .email(ec.getEmail())
                            .build()));
        }

        Patient saved = patientRepository.save(patient);
        log.info("Patient created: {} (userId: {})", saved.getId(), saved.getUserId());
        return toResponse(saved);
    }

    @Cacheable(value = "patients", key = "#id")
    @Transactional(readOnly = true)
    public PatientResponse getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        return toResponse(patient);
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "userId", userId));
        return toResponse(patient);
    }

    @CacheEvict(value = "patients", key = "#id")
    @Transactional
    public PatientResponse updatePatient(Long id, PatientCreateRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAddress(request.getAddress());
        patient.setInsuranceProvider(request.getInsuranceProvider());
        patient.setInsurancePolicyNumber(request.getInsurancePolicyNumber());
        patient.setInsuranceExpiry(request.getInsuranceExpiry());
        patient.setAllergies(request.getAllergies());

        Patient saved = patientRepository.save(patient);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<PatientResponse> getAllPatients(int page, int size, String search, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        Page<Patient> patientPage;

        if (search != null && !search.isBlank()) {
            patientPage = patientRepository.searchPatients(search, pageable);
        } else {
            patientPage = patientRepository.findAll(pageable);
        }

        List<PatientResponse> patients = patientPage.getContent().stream()
                .map(this::toResponse)
                .toList();

        return PagedResponse.of(patients, patientPage.getNumber(), patientPage.getSize(),
                patientPage.getTotalElements(), patientPage.getTotalPages(),
                patientPage.isFirst(), patientPage.isLast());
    }

    @Transactional
    public MedicalHistoryDto addMedicalHistory(Long patientId, MedicalHistoryDto dto) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        MedicalHistory history = MedicalHistory.builder()
                .conditionName(dto.getConditionName())
                .description(dto.getDescription())
                .diagnosedDate(dto.getDiagnosedDate())
                .status(dto.getStatus())
                .treatment(dto.getTreatment())
                .notes(dto.getNotes())
                .build();
        patient.addMedicalHistory(history);
        patientRepository.save(patient);
        return toMedicalHistoryDto(history);
    }

    @Transactional
    public EmergencyContactDto addEmergencyContact(Long patientId, EmergencyContactDto dto) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        EmergencyContact contact = EmergencyContact.builder()
                .name(dto.getName())
                .relationship(dto.getRelationship())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .build();
        patient.addEmergencyContact(contact);
        patientRepository.save(patient);
        return toEmergencyContactDto(contact);
    }

    // ===== Mappers =====

    private PatientResponse toResponse(Patient p) {
        return PatientResponse.builder()
                .id(p.getId()).userId(p.getUserId())
                .firstName(p.getFirstName()).lastName(p.getLastName())
                .email(p.getEmail()).phone(p.getPhone())
                .dateOfBirth(p.getDateOfBirth()).gender(p.getGender())
                .bloodGroup(p.getBloodGroup()).address(p.getAddress())
                .insuranceProvider(p.getInsuranceProvider())
                .insurancePolicyNumber(p.getInsurancePolicyNumber())
                .insuranceExpiry(p.getInsuranceExpiry())
                .allergies(p.getAllergies())
                .medicalHistories(p.getMedicalHistories().stream().map(this::toMedicalHistoryDto).toList())
                .emergencyContacts(p.getEmergencyContacts().stream().map(this::toEmergencyContactDto).toList())
                .createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt())
                .build();
    }

    private MedicalHistoryDto toMedicalHistoryDto(MedicalHistory mh) {
        return MedicalHistoryDto.builder()
                .id(mh.getId()).conditionName(mh.getConditionName())
                .description(mh.getDescription()).diagnosedDate(mh.getDiagnosedDate())
                .status(mh.getStatus()).treatment(mh.getTreatment()).notes(mh.getNotes())
                .build();
    }

    private EmergencyContactDto toEmergencyContactDto(EmergencyContact ec) {
        return EmergencyContactDto.builder()
                .id(ec.getId()).name(ec.getName())
                .relationship(ec.getRelationship()).phone(ec.getPhone()).email(ec.getEmail())
                .build();
    }
}
