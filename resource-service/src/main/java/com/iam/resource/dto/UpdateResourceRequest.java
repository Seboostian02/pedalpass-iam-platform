package com.iam.resource.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Update resource request")
public class UpdateResourceRequest {

    @NotBlank(message = "Name is required")
    @Schema(description = "Resource name", example = "Meeting Room A")
    private String name;

    @Schema(description = "Resource description", example = "10-person meeting room with projector and whiteboard")
    private String description;

    @Schema(description = "Location", example = "Floor 3, Room 302")
    private String location;

    @Schema(description = "Capacity", example = "12")
    private Integer capacity;

    @Schema(description = "Requires approval", example = "true")
    private Boolean requiresApproval;

    @Schema(description = "Whether the resource is active", example = "true")
    private Boolean active;
}
