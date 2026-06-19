package com.hospital.billing.controller;

import com.hospital.billing.dto.*;
import com.hospital.billing.service.BillingService;
import com.hospital.common.dto.ApiResponse;
import com.hospital.common.dto.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/billing") @RequiredArgsConstructor
@Tag(name = "Billing", description = "Billing and payments")
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/invoices")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_STAFF', 'RECEPTIONIST')")
    @Operation(summary = "Create Invoice")
    public ResponseEntity<ApiResponse<InvoiceResponse>> createInvoice(@Valid @RequestBody InvoiceCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Invoice created", billingService.createInvoice(request)));
    }

    @PostMapping("/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_STAFF', 'PATIENT')")
    @Operation(summary = "Process Payment")
    public ResponseEntity<ApiResponse<InvoiceResponse>> processPayment(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Payment successful", billingService.processPayment(request)));
    }

    @GetMapping("/invoices/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_STAFF', 'PATIENT')")
    @Operation(summary = "Get Invoice")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(billingService.getInvoice(id)));
    }

    @GetMapping("/invoices")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_STAFF')")
    @Operation(summary = "List All Invoices")
    public ResponseEntity<ApiResponse<PagedResponse<InvoiceResponse>>> getAllInvoices(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(billingService.getAllInvoices(page, size, status)));
    }

    @GetMapping("/patient/{patientId}/invoices")
    @PreAuthorize("hasAnyRole('ADMIN', 'BILLING_STAFF', 'PATIENT')")
    @Operation(summary = "Get Patient Invoices")
    public ResponseEntity<ApiResponse<PagedResponse<InvoiceResponse>>> getPatientInvoices(
            @PathVariable Long patientId, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(billingService.getPatientInvoices(patientId, page, size)));
    }
}
