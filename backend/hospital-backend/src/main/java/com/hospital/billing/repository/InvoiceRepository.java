package com.hospital.billing.repository;

import com.hospital.billing.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Page<Invoice> findByPatientId(Long patientId, Pageable pageable);
    Page<Invoice> findByStatus(Invoice.InvoiceStatus status, Pageable pageable);
    Optional<Invoice> findByAppointmentId(Long appointmentId);
    List<Invoice> findByStatusAndCreatedAtAfter(Invoice.InvoiceStatus status, LocalDateTime createdAt);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(i.finalAmount) FROM Invoice i WHERE i.status = 'PAID'")
    java.math.BigDecimal sumTotalPaidRevenue();

    long countByStatus(Invoice.InvoiceStatus status);
}
