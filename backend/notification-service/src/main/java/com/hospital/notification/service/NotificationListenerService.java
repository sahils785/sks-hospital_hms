package com.hospital.notification.service;

import com.hospital.common.event.AppointmentEvent;
import com.hospital.common.event.BillingEvent;
import com.hospital.common.security.SecurityConstants;
import com.hospital.notification.entity.NotificationLog;
import com.hospital.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j @Service @RequiredArgsConstructor
public class NotificationListenerService {

    private final NotificationLogRepository repository;

    @RabbitListener(queues = SecurityConstants.QUEUE_APPOINTMENT)
    public void handleAppointmentEvent(AppointmentEvent event) {
        log.info("Received AppointmentEvent: {} for ID: {}", event.getEventType(), event.getAppointmentId());
        String subject = "Appointment " + event.getEventType();
        String message = String.format("Dear %s, your appointment with Dr. %s on %s has been %s.",
                event.getPatientName(), event.getDoctorName(), event.getAppointmentDateTime(), event.getEventType());
        
        sendMockNotification("EMAIL", event.getPatientEmail(), subject, message);
    }

    @RabbitListener(queues = SecurityConstants.QUEUE_BILLING)
    public void handleBillingEvent(BillingEvent event) {
        log.info("Received BillingEvent: {} for Invoice: {}", event.getStatus(), event.getInvoiceId());
        String subject = "Invoice " + event.getStatus();
        String message = String.format("Dear %s, your invoice #%s for amount %s is now %s.",
                event.getPatientName(), event.getInvoiceId(), event.getAmount(), event.getStatus());

        sendMockNotification("EMAIL", event.getPatientEmail(), subject, message);
    }

    private void sendMockNotification(String type, String recipient, String subject, String message) {
        if (recipient == null || recipient.isBlank()) return;

        // Mocking the actual sending process
        log.info("Sending {} to {}: {}", type, recipient, subject);

        NotificationLog logEntry = NotificationLog.builder()
                .type(type).recipient(recipient).subject(subject).message(message).status("SENT").build();
        repository.save(logEntry);
    }
}
