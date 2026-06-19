package com.hospital.billing.service;

import com.hospital.billing.dto.*;
import com.hospital.billing.entity.Invoice;
import com.hospital.billing.entity.Invoice.InvoiceStatus;
import com.hospital.billing.entity.Payment;
import com.hospital.billing.repository.InvoiceRepository;
import com.hospital.billing.repository.PaymentRepository;
import com.hospital.common.dto.PagedResponse;
import com.hospital.common.event.BillingEvent;
import com.hospital.common.exception.BusinessException;
import com.hospital.common.exception.ResourceNotFoundException;
import com.hospital.common.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j @Service @RequiredArgsConstructor
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public InvoiceResponse createInvoice(InvoiceCreateRequest req) {
        BigDecimal discount = req.getDiscount() != null ? req.getDiscount() : BigDecimal.ZERO;
        BigDecimal tax = req.getTax() != null ? req.getTax() : BigDecimal.ZERO;
        BigDecimal finalAmount = req.getTotalAmount().subtract(discount).add(tax);

        Invoice invoice = Invoice.builder()
                .patientId(req.getPatientId()).patientName(req.getPatientName()).patientEmail(req.getPatientEmail())
                .appointmentId(req.getAppointmentId())
                .totalAmount(req.getTotalAmount()).discount(discount).tax(tax)
                .finalAmount(finalAmount).description(req.getDescription())
                .status(InvoiceStatus.PENDING).build();

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Invoice created: {}", saved.getId());

        publishEvent(saved, BillingEvent.BillingStatus.GENERATED);
        return toResponse(saved);
    }

    @Transactional
    public InvoiceResponse processPayment(PaymentRequest req) {
        Invoice invoice = invoiceRepository.findById(req.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", req.getInvoiceId()));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BusinessException("ALREADY_PAID", "Invoice is already paid");
        }

        Payment payment = Payment.builder()
                .invoice(invoice).amount(req.getAmount())
                .paymentMethod(req.getPaymentMethod())
                .transactionId(req.getTransactionId())
                .status(Payment.PaymentStatus.SUCCESS).build();
        
        paymentRepository.save(payment);

        invoice.setStatus(InvoiceStatus.PAID);
        Invoice saved = invoiceRepository.save(invoice);

        publishEvent(saved, BillingEvent.BillingStatus.PAID);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(Long id) {
        return toResponse(invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id)));
    }

    @Transactional(readOnly = true)
    public PagedResponse<InvoiceResponse> getPatientInvoices(Long patientId, int page, int size) {
        Page<Invoice> invPage = invoiceRepository.findByPatientId(patientId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return toPagedResponse(invPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<InvoiceResponse> getAllInvoices(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Invoice> invPage;
        if (status != null && !status.isBlank()) {
            invPage = invoiceRepository.findByStatus(InvoiceStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            invPage = invoiceRepository.findAll(pageable);
        }
        return toPagedResponse(invPage);
    }

    private void publishEvent(Invoice inv, BillingEvent.BillingStatus status) {
        try {
            BillingEvent event = BillingEvent.builder()
                    .invoiceId(inv.getId()).patientId(inv.getPatientId())
                    .patientName(inv.getPatientName()).patientEmail(inv.getPatientEmail())
                    .amount(inv.getFinalAmount()).status(status)
                    .timestamp(LocalDateTime.now()).build();
            rabbitTemplate.convertAndSend(SecurityConstants.EXCHANGE_HOSPITAL, SecurityConstants.ROUTING_KEY_BILLING, event);
        } catch (Exception ex) {
            log.error("Failed to publish billing event: {}", ex.getMessage());
        }
    }

    private InvoiceResponse toResponse(Invoice i) {
        return InvoiceResponse.builder()
                .id(i.getId()).patientId(i.getPatientId()).patientName(i.getPatientName())
                .patientEmail(i.getPatientEmail()).appointmentId(i.getAppointmentId())
                .totalAmount(i.getTotalAmount()).discount(i.getDiscount()).tax(i.getTax())
                .finalAmount(i.getFinalAmount()).status(i.getStatus())
                .description(i.getDescription()).createdAt(i.getCreatedAt()).updatedAt(i.getUpdatedAt())
                .build();
    }

    private PagedResponse<InvoiceResponse> toPagedResponse(Page<Invoice> page) {
        return PagedResponse.of(page.getContent().stream().map(this::toResponse).toList(),
                page.getNumber(), page.getSize(), page.getTotalElements(),
                page.getTotalPages(), page.isFirst(), page.isLast());
    }
}
