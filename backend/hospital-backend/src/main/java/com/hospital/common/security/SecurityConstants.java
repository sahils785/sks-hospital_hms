package com.hospital.common.security;

/**
 * Security constants shared across all microservices.
 */
public final class SecurityConstants {

    private SecurityConstants() {
        // Prevent instantiation
    }

    // JWT
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";
    public static final String AUTHORITIES_KEY = "roles";
    public static final String USER_ID_KEY = "userId";
    public static final String USERNAME_KEY = "username";

    // Token expiry (milliseconds)
    public static final long ACCESS_TOKEN_EXPIRATION = 900_000;       // 15 minutes
    public static final long REFRESH_TOKEN_EXPIRATION = 604_800_000;  // 7 days

    // API paths
    public static final String AUTH_BASE_PATH = "/auth/**";
    public static final String ACTUATOR_PATH = "/actuator/**";
    public static final String SWAGGER_PATH = "/v3/api-docs/**";
    public static final String SWAGGER_UI_PATH = "/swagger-ui/**";
    public static final String SWAGGER_UI_HTML = "/swagger-ui.html";

    // RabbitMQ exchanges and queues
    public static final String EXCHANGE_HOSPITAL = "hospital.exchange";
    public static final String QUEUE_APPOINTMENT = "hospital.appointment.queue";
    public static final String QUEUE_BILLING = "hospital.billing.queue";
    public static final String QUEUE_NOTIFICATION = "hospital.notification.queue";
    public static final String QUEUE_AUDIT = "hospital.audit.queue";
    public static final String ROUTING_KEY_APPOINTMENT = "hospital.appointment";
    public static final String ROUTING_KEY_BILLING = "hospital.billing";
    public static final String ROUTING_KEY_NOTIFICATION = "hospital.notification";
    public static final String ROUTING_KEY_AUDIT = "hospital.audit";

    // Roles
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_DOCTOR = "ROLE_DOCTOR";
    public static final String ROLE_RECEPTIONIST = "ROLE_RECEPTIONIST";
    public static final String ROLE_PHARMACIST = "ROLE_PHARMACIST";
    public static final String ROLE_BILLING_STAFF = "ROLE_BILLING_STAFF";
    public static final String ROLE_PATIENT = "ROLE_PATIENT";
}
