package com.iam.notification.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Update notification preference")
public class UpdatePreferenceRequest {

    @NotBlank(message = "Notification type is required")
    @Schema(description = "Notification type", example = "ACCESS")
    private String notificationType;

    @NotNull(message = "Email enabled flag is required")
    @Schema(description = "Whether email notifications are enabled", example = "true")
    private Boolean emailEnabled;

    @NotNull(message = "In-app enabled flag is required")
    @Schema(description = "Whether in-app notifications are enabled", example = "true")
    private Boolean inAppEnabled;
}
