package com.iam.auth.service;

import com.iam.common.config.RabbitMQConstants;
import com.iam.common.events.AuditEvent;
import com.iam.common.events.UserEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(AuthEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public AuthEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishLoginSuccess(UUID userId, String email, String ipAddress) {
        AuditEvent event = AuditEvent.builder()
                .eventId(UUID.randomUUID())
                .userId(userId)
                .userEmail(email)
                .action("LOGIN_SUCCESS")
                .severity("INFO")
                .ipAddress(ipAddress)
                .serviceName("auth-service")
                .timestamp(LocalDateTime.now())
                .metadata(Map.of("action", "User logged in successfully"))
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConstants.EVENTS_EXCHANGE,
                RabbitMQConstants.AUTH_LOGIN_SUCCESS,
                event);
        log.debug("Published login success event for {}", email);
    }

    public void publishLoginFailed(String email, String ipAddress, String reason) {
        AuditEvent event = AuditEvent.builder()
                .eventId(UUID.randomUUID())
                .userEmail(email)
                .action("LOGIN_FAILED")
                .severity("WARNING")
                .ipAddress(ipAddress)
                .serviceName("auth-service")
                .timestamp(LocalDateTime.now())
                .metadata(Map.of("reason", reason))
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConstants.EVENTS_EXCHANGE,
                RabbitMQConstants.AUTH_LOGIN_FAILED,
                event);
        log.debug("Published login failed event for {}", email);
    }

    public void publishRegistration(UUID userId, String email) {
        AuditEvent event = AuditEvent.builder()
                .eventId(UUID.randomUUID())
                .userId(userId)
                .userEmail(email)
                .action("USER_REGISTERED")
                .severity("INFO")
                .serviceName("auth-service")
                .timestamp(LocalDateTime.now())
                .metadata(Map.of("action", "New user registered"))
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConstants.EVENTS_EXCHANGE,
                RabbitMQConstants.AUTH_REGISTER,
                event);
        log.debug("Published registration event for {}", email);
    }

    public void publishUserCreated(UUID userId, String email, String firstName, String lastName) {
        publishUserCreated(userId, email, firstName, lastName, null, null);
    }

    public void publishUserCreated(UUID userId, String email, String firstName, String lastName,
                                   String roleName, String departmentId) {
        UserEvent event = UserEvent.builder()
                .userId(userId)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .action("CREATED")
                .roleName(roleName)
                .departmentId(departmentId)
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConstants.EVENTS_EXCHANGE,
                RabbitMQConstants.USER_CREATED,
                event);
        log.debug("Published user created event for {}", email);
    }

    public void publishAdminUserCreated(UUID userId, String email, String firstName,
                                        String lastName, String tempPassword) {
        AuditEvent event = AuditEvent.builder()
                .eventId(UUID.randomUUID())
                .userId(userId)
                .userEmail(email)
                .action("ADMIN_USER_CREATED")
                .severity("INFO")
                .serviceName("auth-service")
                .timestamp(LocalDateTime.now())
                .metadata(Map.of(
                        "firstName", firstName,
                        "lastName", lastName,
                        "tempPassword", tempPassword
                ))
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConstants.EVENTS_EXCHANGE,
                RabbitMQConstants.AUTH_ADMIN_USER_CREATED,
                event);
        log.debug("Published admin user created event for {}", email);
    }
}
