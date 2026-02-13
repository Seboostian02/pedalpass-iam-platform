package com.iam.notification.listener;

import com.iam.common.config.RabbitMQConstants;
import com.iam.common.events.AccessDecisionEvent;
import com.iam.common.events.AccessRequestEvent;
import com.iam.common.events.AuditEvent;
import com.iam.common.events.ResourceCollisionEvent;
import com.iam.notification.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    public NotificationEventListener(NotificationService notificationService,
                                     ObjectMapper objectMapper) {
        this.notificationService = notificationService;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = "notification.welcome.queue")
    public void handleWelcomeEvent(AuditEvent event) {
        log.debug("Received welcome event for {}", event.getUserEmail());
        notificationService.createAndSendNotification(
                event.getUserId(),
                event.getUserEmail(),
                "Welcome to IAM Platform",
                "Your account has been created successfully. Welcome to the IAM Platform!",
                "WELCOME"
        );
    }

    @RabbitListener(queues = "notification.access.queue")
    public void handleAccessEvent(Message message) {
        try {
            String routingKey = message.getMessageProperties().getReceivedRoutingKey();
            log.debug("Received access event with routing key: {}", routingKey);

            if ("resource.access.requested".equals(routingKey)) {
                AccessRequestEvent event = objectMapper.readValue(message.getBody(), AccessRequestEvent.class);
                notificationService.createAndSendNotification(
                        event.getUserId(),
                        event.getUserEmail(),
                        "Access Request Submitted",
                        "Your access request for " + event.getResourceName() + " has been submitted and is pending review.",
                        "ACCESS"
                );
            } else {
                AccessDecisionEvent event = objectMapper.readValue(message.getBody(), AccessDecisionEvent.class);
                String title = switch (event.getDecision()) {
                    case "APPROVED" -> "Access Request Approved";
                    case "DENIED" -> "Access Request Denied";
                    case "REVOKED" -> "Access Revoked";
                    default -> "Access Update";
                };

                String body = "Your access request for " + event.getResourceName() +
                        " has been " + event.getDecision().toLowerCase() + ".";
                if (event.getReviewComment() != null && !event.getReviewComment().isBlank()) {
                    body += " Comment: " + event.getReviewComment();
                }

                notificationService.createAndSendNotification(
                        event.getUserId(),
                        event.getUserEmail(),
                        title,
                        body,
                        "ACCESS"
                );
            }
        } catch (Exception e) {
            log.error("Error processing access event: {}", e.getMessage(), e);
        }
    }

    @RabbitListener(queues = "notification.collision.queue")
    public void handleCollisionEvent(Message message) {
        try {
            ResourceCollisionEvent event = objectMapper.readValue(message.getBody(), ResourceCollisionEvent.class);
            log.debug("Received collision event for {}", event.getRequestingUserEmail());
            notificationService.createAndSendNotification(
                    event.getRequestingUserId(),
                    event.getRequestingUserEmail(),
                    "Resource Scheduling Conflict",
                    "A scheduling conflict was detected for resource " + event.getResourceName() +
                            " between " + event.getRequestedFrom() + " and " + event.getRequestedUntil() +
                            ". Please choose a different time slot.",
                    "COLLISION"
            );
        } catch (Exception e) {
            log.error("Error processing collision event: {}", e.getMessage(), e);
        }
    }

    @RabbitListener(queues = "notification.security.queue")
    public void handleSecurityAlertEvent(AuditEvent event) {
        log.debug("Received security alert for {}", event.getUserEmail());
        if (event.getUserId() != null) {
            notificationService.createAndSendNotification(
                    event.getUserId(),
                    event.getUserEmail(),
                    "Security Alert",
                    "A security alert has been triggered for your account: " + event.getAction(),
                    "SECURITY"
            );
        }
    }

    @RabbitListener(queues = "notification.login.failed.queue")
    public void handleLoginFailedEvent(AuditEvent event) {
        log.debug("Received login failed event for {}", event.getUserEmail());
        if (event.getUserEmail() != null) {
            notificationService.createAndSendNotification(
                    event.getUserId(),
                    event.getUserEmail(),
                    "Failed Login Attempt",
                    "A failed login attempt was detected on your account. If this was not you, please change your password immediately.",
                    "SECURITY"
            );
        }
    }

    @RabbitListener(queues = RabbitMQConstants.NOTIFICATION_ADMIN_WELCOME_QUEUE)
    public void handleAdminWelcomeEvent(AuditEvent event) {
        log.info("Received admin welcome event for {}", event.getUserEmail());
        String firstName = String.valueOf(event.getMetadata().getOrDefault("firstName", "User"));
        String tempPassword = String.valueOf(event.getMetadata().get("tempPassword"));

        String emailBody = String.format(
                "Hello %s,\n\n" +
                "Your IAM Platform account has been created by an administrator.\n\n" +
                "Your temporary password is: %s\n\n" +
                "Please log in and change your password immediately.\n\n" +
                "Best regards,\nIAM Platform Team",
                firstName, tempPassword);

        // Send email with temp password
        notificationService.createAndSendNotification(
                event.getUserId(),
                event.getUserEmail(),
                "Your IAM Platform Account",
                emailBody,
                "WELCOME"
        );
    }

    @RabbitListener(queues = RabbitMQConstants.NOTIFICATION_PASSWORD_CHANGED_QUEUE)
    public void handlePasswordChangedEvent(AuditEvent event) {
        log.info("Received password changed event for {}", event.getUserEmail());

        String emailBody = "Hello,\n\n" +
                "Your IAM Platform password was successfully changed.\n\n" +
                "If you did not make this change, please contact support immediately.\n\n" +
                "Best regards,\nIAM Platform Team";

        notificationService.createAndSendNotification(
                event.getUserId(),
                event.getUserEmail(),
                "Password Changed",
                emailBody,
                "SECURITY"
        );
    }
}
