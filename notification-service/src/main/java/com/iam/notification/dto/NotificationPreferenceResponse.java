package com.iam.notification.dto;

import com.iam.notification.model.NotificationPreference;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Notification preference")
public class NotificationPreferenceResponse {

    @Schema(description = "Preference ID")
    private UUID id;

    @Schema(description = "Notification type", example = "ACCESS")
    private String notificationType;

    @Schema(description = "Whether email notifications are enabled")
    private boolean emailEnabled;

    @Schema(description = "Whether in-app notifications are enabled")
    private boolean inAppEnabled;

    public static NotificationPreferenceResponse fromEntity(NotificationPreference p) {
        return NotificationPreferenceResponse.builder()
                .id(p.getId())
                .notificationType(p.getNotificationType())
                .emailEnabled(p.isEmailEnabled())
                .inAppEnabled(p.isInAppEnabled())
                .build();
    }
}
