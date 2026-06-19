package com.hospital.billing.dto;

import com.hospital.billing.entity.Invoice.InvoiceStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InvoiceResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private Long appointmentId;
    private BigDecimal totalAmount;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal finalAmount;
    private InvoiceStatus status;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
