package com.hospital.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.common.event.AuditEvent;
import com.hospital.common.security.SecurityConstants;
import com.hospital.common.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.annotation.*;
import java.time.LocalDateTime;

/**
 * AOP aspect for automated audit logging.
 * Publishes audit events to RabbitMQ when methods annotated with @Auditable are called.
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Custom annotation to mark methods for audit logging.
     */
    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    public @interface Auditable {
        String action();
        String entityType() default "";
        AuditEvent.AuditSeverity severity() default AuditEvent.AuditSeverity.INFO;
    }

    @Around("@annotation(auditable)")
    public Object audit(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        Object result = joinPoint.proceed();

        try {
            AuditEvent event = buildAuditEvent(auditable, joinPoint);
            rabbitTemplate.convertAndSend(
                    SecurityConstants.EXCHANGE_HOSPITAL,
                    SecurityConstants.ROUTING_KEY_AUDIT,
                    event
            );
            log.debug("Audit event published: action={}, entity={}",
                    auditable.action(), auditable.entityType());
        } catch (Exception ex) {
            // Never let audit logging fail the main operation
            log.error("Failed to publish audit event: {}", ex.getMessage());
        }

        return result;
    }

    private AuditEvent buildAuditEvent(Auditable auditable, ProceedingJoinPoint joinPoint) {
        AuditEvent.AuditEventBuilder builder = AuditEvent.builder()
                .action(auditable.action())
                .entityType(auditable.entityType())
                .severity(auditable.severity())
                .serviceName(getServiceName(joinPoint))
                .description(joinPoint.getSignature().toShortString())
                .timestamp(LocalDateTime.now());

        // Extract user info from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            builder.userId(principal.getId())
                    .username(principal.getUsername());
        }

        // Extract IP address from request
        try {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                builder.ipAddress(getClientIp(request))
                        .userAgent(request.getHeader("User-Agent"));
            }
        } catch (Exception ex) {
            log.debug("Could not extract request info for audit: {}", ex.getMessage());
        }

        return builder.build();
    }

    private String getServiceName(ProceedingJoinPoint joinPoint) {
        return joinPoint.getTarget().getClass().getSimpleName();
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
