package com.iam.notification.listener;

import com.iam.common.config.RabbitMQConstants;
import com.iam.common.events.AccessDecisionEvent;
import com.iam.common.events.AccessRequestEvent;
import com.iam.common.events.AuditEvent;
import com.iam.common.events.ResourceCollisionEvent;
import com.iam.notification.model.NotificationType;
import com.iam.notification.service.NotificationService;
import com.iam.notification.service.UserServiceClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);

    private final NotificationService notificationService;
    private final UserServiceClient userServiceClient;
    private final ObjectMapper objectMapper;

    public NotificationEventListener(NotificationService notificationService,
                                     UserServiceClient userServiceClient,
                                     ObjectMapper objectMapper) {
        this.notificationService = notificationService;
        this.userServiceClient = userServiceClient;
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
                NotificationType.WELCOME.name()
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
                        NotificationType.ACCESS.name()
                );

                // Notify admins and resource managers about the pending request
                notifyAdminsAboutAccessRequest(event);
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
                        NotificationType.ACCESS.name()
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
                    NotificationType.COLLISION.name()
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
                    NotificationType.SECURITY.name()
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
                    NotificationType.SECURITY.name()
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
                NotificationType.WELCOME.name()
        );
    }

    private void notifyAdminsAboutAccessRequest(AccessRequestEvent event) {
        try {
            List<String> adminEmails = userServiceClient.getEmailsByRole("ADMIN");
            List<String> managerEmails = userServiceClient.getEmailsByRole("RESOURCE_MANAGER");

            // Combine and deduplicate
            java.util.Set<String> allApprovers = new java.util.LinkedHashSet<>();
            allApprovers.addAll(adminEmails);
            allApprovers.addAll(managerEmails);
            // Don't notify the requester themselves
            allApprovers.remove(event.getUserEmail());

            String emailBody = String.format(
                    "Hello,\n\n" +
                    "A new access request requires your review.\n\n" +
                    "Requested by: %s\n" +
                    "Resource: %s\n" +
                    "Access level: %s\n" +
                    "Justification: %s\n\n" +
                    "Please log in to the IAM Platform to review this request.\n\n" +
                    "Best regards,\nIAM Platform Team",
                    event.getUserEmail(),
                    event.getResourceName(),
                    event.getAccessLevel(),
                    event.getJustification() != null ? event.getJustification() : "N/A");

            for (String approverEmail : allApprovers) {
                notificationService.sendEmailDirect(approverEmail, "New Access Request Pending Review", emailBody);
            }

            log.info("Notified {} approvers about access request from {}", allApprovers.size(), event.getUserEmail());
        } catch (Exception e) {
            log.error("Failed to notify admins about access request: {}", e.getMessage(), e);
        }
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
                NotificationType.SECURITY.name()
        );
    }
}
