package com.iam.resource.dto;

import com.iam.resource.model.Resource;
import com.iam.resource.model.ResourceCategory;
import com.iam.resource.model.ResourceType;
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
@Schema(description = "Resource response")
public class ResourceResponse {

    @Schema(description = "Resource UUID", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "Resource name", example = "Meeting Room A")
    private String name;

    @Schema(description = "Resource description", example = "10-person meeting room with projector")
    private String description;

    @Schema(description = "Resource type", example = "PHYSICAL")
    private ResourceType resourceType;

    @Schema(description = "Resource category", example = "MEETING_ROOM")
    private ResourceCategory resourceCategory;

    @Schema(description = "Location", example = "Floor 3, Room 302")
    private String location;

    @Schema(description = "Capacity", example = "10")
    private Integer capacity;

    @Schema(description = "Active status", example = "true")
    private Boolean active;

    @Schema(description = "Requires approval", example = "true")
    private Boolean requiresApproval;

    @Schema(description = "Creation timestamp", example = "2026-02-13T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2026-02-13T10:30:00")
    private LocalDateTime updatedAt;

    public static ResourceResponse fromEntity(Resource resource) {
        return ResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .description(resource.getDescription())
                .resourceType(resource.getResourceType())
                .resourceCategory(resource.getResourceCategory())
                .location(resource.getLocation())
                .capacity(resource.getCapacity())
                .active(resource.isActive())
                .requiresApproval(resource.isRequiresApproval())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }
}
