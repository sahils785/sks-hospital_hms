package com.hospital.billing.dto;

import com.hospital.billing.entity.Payment.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentRequest {
    @NotNull private Long invoiceId;
    @NotNull private BigDecimal amount;
    @NotNull private PaymentMethod paymentMethod;
    private String transactionId;
}
