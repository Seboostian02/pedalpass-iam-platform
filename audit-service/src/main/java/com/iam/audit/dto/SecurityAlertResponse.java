package com.iam.audit.dto;

import com.iam.audit.model.AlertStatus;
import com.iam.audit.model.SecurityAlert;
import com.iam.audit.model.SeverityLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Security alert")
public class SecurityAlertResponse {

    @Schema(description = "Alert ID")
    private UUID id;

    @Schema(description = "Type of alert", example = "BRUTE_FORCE_DETECTED")
    private String alertType;

    @Schema(description = "Severity level", example = "CRITICAL")
    private SeverityLevel severity;

    @Schema(description = "Alert status", example = "OPEN")
    private AlertStatus status;

    @Schema(description = "Affected user ID")
    private UUID userId;

    @Schema(description = "Affected user email")
    private String userEmail;

    @Schema(description = "Alert description")
    private String description;

    @Schema(description = "Who resolved the alert")
    private UUID resolvedBy;

    @Schema(description = "When the alert was resolved")
    private LocalDateTime resolvedAt;

    @Schema(description = "When the alert was created")
    private LocalDateTime createdAt;

    public static SecurityAlertResponse fromEntity(SecurityAlert alert) {
        return SecurityAlertResponse.builder()
                .id(alert.getId())
                .alertType(alert.getAlertType())
                .severity(alert.getSeverity())
                .status(alert.getStatus())
                .userId(alert.getUserId())
                .userEmail(alert.getUserEmail())
                .description(alert.getDescription())
                .resolvedBy(alert.getResolvedBy())
                .resolvedAt(alert.getResolvedAt())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
