package com.iam.resource.dto;

import com.iam.resource.model.ResourceCategory;
import com.iam.resource.model.ResourceType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Create resource request")
public class CreateResourceRequest {

    @NotBlank(message = "Name is required")
    @Schema(description = "Resource name", example = "Meeting Room A")
    private String name;

    @Schema(description = "Resource description", example = "10-person meeting room with projector")
    private String description;

    @NotNull(message = "Resource type is required")
    @Schema(description = "Resource type", example = "PHYSICAL")
    private ResourceType resourceType;

    @NotNull(message = "Resource category is required")
    @Schema(description = "Resource category", example = "MEETING_ROOM")
    private ResourceCategory resourceCategory;

    @Schema(description = "Location", example = "Floor 3, Room 302")
    private String location;

    @Schema(description = "Capacity", example = "10")
    private Integer capacity;

    @Schema(description = "Requires approval", example = "true")
    private Boolean requiresApproval = true;
}
