package com.hospital.doctor.repository;

import com.hospital.doctor.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    boolean existsByLicenseNumber(String licenseNumber);
    List<Doctor> findBySpecializationAndAvailableTrue(String specialization);
    List<Doctor> findByDepartmentAndAvailableTrue(String department);
    Page<Doctor> findByAvailableTrue(Pageable pageable);

    @Query("SELECT d FROM Doctor d WHERE d.available = true AND (" +
            "LOWER(d.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(d.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(d.specialization) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(d.department) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Doctor> searchDoctors(@Param("search") String search, Pageable pageable);

    @Query("SELECT DISTINCT d.specialization FROM Doctor d WHERE d.available = true ORDER BY d.specialization")
    List<String> findAllSpecializations();

    @Query("SELECT DISTINCT d.department FROM Doctor d WHERE d.available = true ORDER BY d.department")
    List<String> findAllDepartments();
}
