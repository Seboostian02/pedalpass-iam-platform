package com.iam.resource.dto;

import com.iam.resource.model.AccessRequest;
import com.iam.resource.model.RequestStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Access request response")
public class AccessRequestResponse {

    @Schema(description = "Request UUID", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "User UUID", example = "660e8400-e29b-41d4-a716-446655440001")
    private UUID userId;

    @Schema(description = "User email", example = "john.doe@company.com")
    private String userEmail;

    @Schema(description = "Resource details")
    private ResourceResponse resource;

    @Schema(description = "Request status", example = "PENDING")
    private RequestStatus status;

    @Schema(description = "Access level", example = "READ")
    private String accessLevel;

    @Schema(description = "Justification", example = "Need access for project demo")
    private String justification;

    @Schema(description = "Scheduled start time", example = "2026-02-15T10:00:00")
    private LocalDateTime scheduledStart;

    @Schema(description = "Scheduled end time", example = "2026-02-15T12:00:00")
    private LocalDateTime scheduledEnd;

    @Schema(description = "Reviewer UUID", example = "770e8400-e29b-41d4-a716-446655440002")
    private UUID reviewedBy;

    @Schema(description = "Review comment", example = "Approved for project work")
    private String reviewComment;

    @Schema(description = "Creation timestamp", example = "2026-02-13T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2026-02-13T10:30:00")
    private LocalDateTime updatedAt;

    public static AccessRequestResponse fromEntity(AccessRequest request) {
        return AccessRequestResponse.builder()
                .id(request.getId())
                .userId(request.getUserId())
                .userEmail(request.getUserEmail())
                .resource(ResourceResponse.fromEntity(request.getResource()))
                .status(request.getStatus())
                .accessLevel(request.getAccessLevel())
                .justification(request.getJustification())
                .scheduledStart(request.getScheduledStart())
                .scheduledEnd(request.getScheduledEnd())
                .reviewedBy(request.getReviewedBy())
                .reviewComment(request.getReviewComment())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
