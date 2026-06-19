package com.hospital.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Event for audit trail logging.
 * Published by services whenever a significant action occurs.
 * Consumed by the Audit Service for HIPAA compliance tracking.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long userId;
    private String username;
    private String action;
    private String entityType;
    private Long entityId;
    private String oldValue;
    private String newValue;
    private String serviceName;
    private String ipAddress;
    private String userAgent;
    private String description;
    private AuditSeverity severity;
    private LocalDateTime timestamp;

    public enum AuditSeverity {
        INFO,
        WARNING,
        CRITICAL
    }
}
