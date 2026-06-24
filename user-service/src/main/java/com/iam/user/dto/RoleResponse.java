package com.iam.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Role response")
public class RoleResponse {

    @Schema(description = "Role ID")
    private UUID id;

    @Schema(description = "Role name", example = "ADMIN")
    private String name;

    @Schema(description = "Role description", example = "Full system administrator")
    private String description;

    @Schema(description = "Is system role (cannot be deleted)")
    private boolean systemRole;

    @Schema(description = "Permission names assigned to this role", example = "[\"user:read\", \"user:write\"]")
    private Set<String> permissions;
}
