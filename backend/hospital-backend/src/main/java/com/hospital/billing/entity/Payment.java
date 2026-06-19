package com.hospital.billing.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Payment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Column(name = "transaction_id", length = 100) private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.SUCCESS;

    @CreationTimestamp @Column(name = "payment_date", updatable = false) private LocalDateTime paymentDate;

    public enum PaymentMethod {
        CASH, CREDIT_CARD, DEBIT_CARD, INSURANCE, UPI
    }

    public enum PaymentStatus {
        SUCCESS, FAILED, REFUNDED
    }
}
