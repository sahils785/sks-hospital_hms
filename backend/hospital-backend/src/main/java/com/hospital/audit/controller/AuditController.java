package com.hospital.audit.controller;

import com.hospital.audit.entity.AuditLog;
import com.hospital.audit.repository.AuditLogRepository;
import com.hospital.common.dto.ApiResponse;
import com.hospital.common.dto.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/audit") @RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Audit log viewing")
public class AuditController {

    private final AuditLogRepository repository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get All Audit Logs")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLog>>> getAllLogs(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<AuditLog> logPage = repository.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(logPage)));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get User Audit Logs")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLog>>> getUserLogs(
            @PathVariable Long userId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<AuditLog> logPage = repository.findByUserId(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(logPage)));
    }

    private PagedResponse<AuditLog> toPagedResponse(Page<AuditLog> page) {
        return PagedResponse.of(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isFirst(), page.isLast());
    }
}
