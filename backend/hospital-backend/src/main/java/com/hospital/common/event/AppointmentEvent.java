package com.hospital.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Event published when an appointment is created, updated, or cancelled.
 * Consumed by Notification and Audit services.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private String patientName;
    private String patientEmail;
    private String doctorName;
    private LocalDateTime appointmentDateTime;
    private String status;
    private EventType eventType;
    private String reason;
    private LocalDateTime timestamp;

    public enum EventType {
        CREATED,
        CONFIRMED,
        RESCHEDULED,
        CANCELLED,
        COMPLETED,
        NO_SHOW
    }
}
