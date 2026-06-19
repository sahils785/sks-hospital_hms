package com.hospital.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Event for triggering notifications (email, SMS, push).
 * Published by any service that needs to notify a user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String recipientEmail;
    private String recipientPhone;
    private String recipientName;
    private Long recipientUserId;
    private NotificationType type;
    private NotificationChannel channel;
    private String subject;
    private String templateName;
    private Map<String, String> templateVariables;
    private LocalDateTime timestamp;

    public enum NotificationType {
        APPOINTMENT_CONFIRMATION,
        APPOINTMENT_REMINDER,
        APPOINTMENT_CANCELLED,
        PRESCRIPTION_CREATED,
        BILLING_INVOICE,
        PAYMENT_CONFIRMATION,
        PASSWORD_RESET,
        WELCOME,
        GENERAL
    }

    public enum NotificationChannel {
        EMAIL,
        SMS,
        BOTH
    }
}
