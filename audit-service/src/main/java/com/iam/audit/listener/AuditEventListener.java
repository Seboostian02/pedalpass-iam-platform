package com.iam.audit.listener;

import com.iam.audit.model.AuditLog;
import com.iam.audit.model.SecurityAlert;
import com.iam.audit.model.SeverityLevel;
import com.iam.audit.repository.AuditLogRepository;
import com.iam.audit.repository.SecurityAlertRepository;
import com.iam.common.events.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AuditEventListener {

    private static final Logger log = LoggerFactory.getLogger(AuditEventListener.class);

    private final AuditLogRepository auditLogRepository;
    private final SecurityAlertRepository securityAlertRepository;
    private final ObjectMapper objectMapper;

    public AuditEventListener(AuditLogRepository auditLogRepository,
                              SecurityAlertRepository securityAlertRepository,
                              ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.securityAlertRepository = securityAlertRepository;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = "audit.auth.queue")
    public void handleAuthEvent(AuditEvent event) {
        log.debug("Received auth event: {}", event.getAction());
        saveAuditLog(event);

        if ("LOGIN_FAILED".equals(event.getAction())) {
            checkBruteForce(event);
        }
    }

    @RabbitListener(queues = "audit.user.queue")
    public void handleUserEvent(Message message) {
        try {
            UserEvent event = objectMapper.readValue(message.getBody(), UserEvent.class);
            log.debug("Received user event: {} for {}", event.getAction(), event.getEmail());

            AuditLog auditLog = AuditLog.builder()
                    .userId(event.getUserId())
                    .userEmail(event.getEmail())
                    .action("USER_" + event.getAction())
                    .resourceType("USER")
                    .resourceId(event.getUserId() != null ? event.getUserId().toString() : null)
                    .severity(SeverityLevel.INFO)
                    .details(objectMapper.writeValueAsString(event))
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Saved audit log: USER_{} for {}", event.getAction(), event.getEmail());
        } catch (Exception e) {
            log.error("Error processing user event: {}", e.getMessage(), e);
        }
    }

    @RabbitListener(queues = "audit.resource.queue")
    public void handleResourceEvent(Message message) {
        try {
            String routingKey = message.getMessageProperties().getReceivedRoutingKey();
            log.debug("Received resource event with routing key: {}", routingKey);

            AuditLog.AuditLogBuilder logBuilder = AuditLog.builder()
                    .resourceType("RESOURCE");

            if ("resource.access.requested".equals(routingKey)) {
                AccessRequestEvent event = objectMapper.readValue(message.getBody(), AccessRequestEvent.class);
                logBuilder.eventId(event.getEventId())
                        .userId(event.getUserId())
                        .userEmail(event.getUserEmail())
                        .action("ACCESS_REQUESTED")
                        .resourceId(event.getResourceId() != null ? event.getResourceId().toString() : null)
                        .severity(SeverityLevel.INFO)
                        .details(objectMapper.writeValueAsString(event));
            } else if (routingKey != null && routingKey.startsWith("resource.access.")) {
                AccessDecisionEvent event = objectMapper.readValue(message.getBody(), AccessDecisionEvent.class);
                logBuilder.userId(event.getUserId())
                        .userEmail(event.getUserEmail())
                        .action("ACCESS_" + event.getDecision())
                        .resourceId(event.getResourceId() != null ? event.getResourceId().toString() : null)
                        .severity(SeverityLevel.INFO)
                        .details(objectMapper.writeValueAsString(event));
            } else if (routingKey != null && routingKey.startsWith("resource.collision")) {
                ResourceCollisionEvent event = objectMapper.readValue(message.getBody(), ResourceCollisionEvent.class);
                logBuilder.userId(event.getRequestingUserId())
                        .userEmail(event.getRequestingUserEmail())
                        .action("COLLISION_DETECTED")
                        .resourceId(event.getResourceId() != null ? event.getResourceId().toString() : null)
                        .severity(SeverityLevel.WARNING)
                        .details(objectMapper.writeValueAsString(event));
            } else {
                log.warn("Unknown resource routing key: {}", routingKey);
                return;
            }

            auditLogRepository.save(logBuilder.build());
            log.debug("Saved resource audit log for routing key: {}", routingKey);
        } catch (Exception e) {
            log.error("Error processing resource event: {}", e.getMessage(), e);
        }
    }

    @RabbitListener(queues = "audit.security.queue")
    public void handleSecurityEvent(AuditEvent event) {
        log.debug("Received security event: {}", event.getAction());
        saveAuditLog(event);

        SecurityAlert alert = SecurityAlert.builder()
                .alertType(event.getAction())
                .severity(parseSeverity(event.getSeverity()))
                .userId(event.getUserId())
                .userEmail(event.getUserEmail())
                .description(convertDetailsToString(event))
                .build();
        securityAlertRepository.save(alert);
        log.info("Created security alert: {} for {}", event.getAction(), event.getUserEmail());
    }

    private void saveAuditLog(AuditEvent event) {
        AuditLog auditLog = AuditLog.builder()
                .eventId(event.getEventId())
                .userId(event.getUserId())
                .userEmail(event.getUserEmail())
                .action(event.getAction())
                .resourceType(event.getResourceType())
                .resourceId(event.getResourceId())
                .severity(parseSeverity(event.getSeverity()))
                .ipAddress(event.getIpAddress())
                .userAgent(event.getUserAgent())
                .details(convertDetailsToString(event))
                .build();

        auditLogRepository.save(auditLog);
        log.debug("Saved audit log: {} for {}", event.getAction(), event.getUserEmail());
    }

    private void checkBruteForce(AuditEvent event) {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);
        long failedAttempts = auditLogRepository.countByUserEmailAndActionAndCreatedAtAfter(
                event.getUserEmail(), "LOGIN_FAILED", threshold);

        if (failedAttempts >= 5) {
            log.warn("Brute force detected for {}: {} failed attempts in 30 minutes",
                    event.getUserEmail(), failedAttempts);

            SecurityAlert alert = SecurityAlert.builder()
                    .alertType("BRUTE_FORCE_DETECTED")
                    .severity(SeverityLevel.CRITICAL)
                    .userId(event.getUserId())
                    .userEmail(event.getUserEmail())
                    .description("Brute force attack detected: " + failedAttempts +
                            " failed login attempts in the last 30 minutes for " + event.getUserEmail())
                    .build();
            securityAlertRepository.save(alert);
        }
    }

    private SeverityLevel parseSeverity(String severity) {
        try {
            return severity != null ? SeverityLevel.valueOf(severity) : SeverityLevel.INFO;
        } catch (IllegalArgumentException e) {
            return SeverityLevel.INFO;
        }
    }

    private String convertDetailsToString(AuditEvent event) {
        try {
            if (event.getMetadata() != null) {
                return objectMapper.writeValueAsString(event.getMetadata());
            }
        } catch (Exception e) {
            log.error("Error converting event details to string", e);
        }
        return null;
    }
}
