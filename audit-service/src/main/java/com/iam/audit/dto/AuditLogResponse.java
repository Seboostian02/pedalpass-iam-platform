package com.iam.audit.dto;

import com.iam.audit.model.AuditLog;
import com.iam.audit.model.SeverityLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Audit log entry")
public class AuditLogResponse {

    @Schema(description = "Audit log ID")
    private UUID id;

    @Schema(description = "Original event ID")
    private UUID eventId;

    @Schema(description = "User who performed the action")
    private UUID userId;

    @Schema(description = "User email")
    private String userEmail;

    @Schema(description = "Action performed", example = "LOGIN_FAILED")
    private String action;

    @Schema(description = "Type of resource affected", example = "RESOURCE")
    private String resourceType;

    @Schema(description = "ID of resource affected")
    private String resourceId;

    @Schema(description = "Severity level", example = "INFO")
    private SeverityLevel severity;

    @Schema(description = "Client IP address")
    private String ipAddress;

    @Schema(description = "Client user agent")
    private String userAgent;

    @Schema(description = "Event details as JSON")
    private String details;

    @Schema(description = "When the event occurred")
    private LocalDateTime createdAt;

    public static AuditLogResponse fromEntity(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .eventId(log.getEventId())
                .userId(log.getUserId())
                .userEmail(log.getUserEmail())
                .action(log.getAction())
                .resourceType(log.getResourceType())
                .resourceId(log.getResourceId())
                .severity(log.getSeverity())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
