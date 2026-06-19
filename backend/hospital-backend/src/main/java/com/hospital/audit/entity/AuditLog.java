package com.hospital.audit.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_user", columnList = "user_id"),
        @Index(name = "idx_audit_action", columnList = "action"),
        @Index(name = "idx_audit_resource", columnList = "resource_type")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AuditLog {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id") private Long userId;
    @Column(name = "username", length = 100) private String username;

    @Column(nullable = false, length = 100) private String action;
    @Column(name = "resource_type", nullable = false, length = 100) private String resourceType;
    @Column(name = "resource_id") private String resourceId;

    @Column(columnDefinition = "TEXT") private String details;

    @Column(name = "ip_address", length = 50) private String ipAddress;
    @Column(nullable = false) private LocalDateTime timestamp;
}
