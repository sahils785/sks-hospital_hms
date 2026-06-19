package com.hospital.audit.service;

import com.hospital.audit.entity.AuditLog;
import com.hospital.audit.repository.AuditLogRepository;
import com.hospital.common.event.AuditEvent;
import com.hospital.common.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j @Service @RequiredArgsConstructor
public class AuditListenerService {

    private final AuditLogRepository repository;

    @RabbitListener(queues = SecurityConstants.QUEUE_AUDIT)
    public void handleAuditEvent(AuditEvent event) {
        log.info("Received AuditEvent: {} on {} by {}", event.getAction(), event.getResourceType(), event.getUsername());
        
        AuditLog auditLog = AuditLog.builder()
                .userId(event.getUserId())
                .username(event.getUsername())
                .action(event.getAction())
                .resourceType(event.getResourceType())
                .resourceId(event.getResourceId())
                .details(event.getDetails())
                .ipAddress(event.getIpAddress())
                .timestamp(event.getTimestamp())
                .build();
                
        repository.save(auditLog);
    }
}
