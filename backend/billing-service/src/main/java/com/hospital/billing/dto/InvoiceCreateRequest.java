package com.hospital.billing.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InvoiceCreateRequest {
    @NotNull private Long patientId;
    private String patientName;
    private String patientEmail;
    private Long appointmentId;
    @NotNull private BigDecimal totalAmount;
    private BigDecimal discount;
    private BigDecimal tax;
    private String description;
}
