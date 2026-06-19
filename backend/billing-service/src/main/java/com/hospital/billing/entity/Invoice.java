package com.hospital.billing.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices", indexes = {
        @Index(name = "idx_invoice_patient", columnList = "patient_id"),
        @Index(name = "idx_invoice_status", columnList = "status")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Invoice {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "patient_name", length = 100) private String patientName;
    @Column(name = "patient_email", length = 100) private String patientEmail;

    @Column(name = "appointment_id") private Long appointmentId;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2) private BigDecimal totalAmount;
    @Column(name = "discount", precision = 10, scale = 2) @Builder.Default private BigDecimal discount = BigDecimal.ZERO;
    @Column(name = "tax", precision = 10, scale = 2) @Builder.Default private BigDecimal tax = BigDecimal.ZERO;
    @Column(name = "final_amount", nullable = false, precision = 10, scale = 2) private BigDecimal finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.PENDING;

    @Column(columnDefinition = "TEXT") private String description;

    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at") private LocalDateTime updatedAt;

    public enum InvoiceStatus {
        PENDING, PAID, OVERDUE, CANCELLED
    }
}
