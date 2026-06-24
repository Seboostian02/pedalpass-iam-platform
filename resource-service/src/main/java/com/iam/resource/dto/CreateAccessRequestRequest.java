package com.iam.resource.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Create access request")
public class CreateAccessRequestRequest {

    @NotNull(message = "Resource ID is required")
    @Schema(description = "Resource UUID", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID resourceId;

    @Schema(description = "Access level", example = "READ")
    private String accessLevel;

    @Schema(description = "Justification", example = "Need access for project demo")
    private String justification;

    @Schema(description = "Scheduled start time", example = "2026-02-15T10:00:00")
    private LocalDateTime scheduledStart;

    @Schema(description = "Scheduled end time", example = "2026-02-15T12:00:00")
    private LocalDateTime scheduledEnd;
}
