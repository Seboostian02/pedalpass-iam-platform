package com.iam.notification.dto;

import com.iam.notification.model.Notification;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Notification")
public class NotificationResponse {

    @Schema(description = "Notification ID")
    private UUID id;

    @Schema(description = "User ID")
    private UUID userId;

    @Schema(description = "User email")
    private String userEmail;

    @Schema(description = "Notification title", example = "Access Request Approved")
    private String title;

    @Schema(description = "Notification message")
    private String message;

    @Schema(description = "Notification type", example = "ACCESS")
    private String notificationType;

    @Schema(description = "Whether the notification has been read")
    private boolean read;

    @Schema(description = "Whether the email was sent")
    private boolean emailSent;

    @Schema(description = "When the notification was created")
    private LocalDateTime createdAt;

    @Schema(description = "When the notification was read")
    private LocalDateTime readAt;

    public static NotificationResponse fromEntity(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .userEmail(n.getUserEmail())
                .title(n.getTitle())
                .message(n.getMessage())
                .notificationType(n.getNotificationType())
                .read(n.isRead())
                .emailSent(n.isEmailSent())
                .createdAt(n.getCreatedAt())
                .readAt(n.getReadAt())
                .build();
    }
}
