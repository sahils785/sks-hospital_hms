package com.hospital.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_logs", indexes = {
        @Index(name = "idx_notif_recipient", columnList = "recipient"),
        @Index(name = "idx_notif_type", columnList = "type")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationLog {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50) private String type; // EMAIL, SMS
    @Column(nullable = false, length = 100) private String recipient;
    @Column(nullable = false, length = 200) private String subject;
    @Column(nullable = false, columnDefinition = "TEXT") private String message;
    
    @Column(nullable = false, length = 20) @Builder.Default private String status = "SENT";

    @CreationTimestamp @Column(name = "sent_at", updatable = false) private LocalDateTime sentAt;
}
