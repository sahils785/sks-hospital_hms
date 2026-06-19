package com.hospital.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Event published when billing actions occur (invoice created, payment received).
 * Consumed by Notification and Audit services.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long invoiceId;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private String paymentStatus;
    private String paymentMethod;
    private EventType eventType;
    private LocalDateTime timestamp;

    public enum EventType {
        INVOICE_CREATED,
        PAYMENT_RECEIVED,
        PAYMENT_FAILED,
        REFUND_ISSUED,
        INSURANCE_CLAIMED
    }
}
