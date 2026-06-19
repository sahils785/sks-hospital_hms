package com.hospital.audit.service;

import com.hospital.audit.entity.AuditLog;
import com.hospital.audit.repository.AuditLogRepository;
import com.hospital.common.event.AuditEvent;
import com.hospital.common.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Slf4j @Service @RequiredArgsConstructor
public class AuditListenerService {

    private final AuditLogRepository repository;

    @EventListener
    public void handleAuditEvent(AuditEvent event) {
        log.info("Received AuditEvent: {} on {} by {}", event.getAction(), event.getEntityType(), event.getUsername());
        
        AuditLog auditLog = AuditLog.builder()
                .userId(event.getUserId())
                .username(event.getUsername())
                .action(event.getAction())
                .resourceType(event.getEntityType())
                .resourceId(event.getEntityId() != null ? event.getEntityId().toString() : null)
                .details(event.getDescription())
                .ipAddress(event.getIpAddress())
                .timestamp(event.getTimestamp())
                .build();
                
        repository.save(auditLog);
    }
}
