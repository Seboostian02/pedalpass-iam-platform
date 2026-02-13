package com.iam.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "User response")
public class UserResponse {

    @Schema(description = "User ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "User email", example = "john.doe@company.com")
    private String email;

    @Schema(description = "First name", example = "John")
    private String firstName;

    @Schema(description = "Last name", example = "Doe")
    private String lastName;

    @Schema(description = "Phone number", example = "+40712345678")
    private String phoneNumber;

    @Schema(description = "Is user active")
    private boolean active;

    @Schema(description = "Department name", example = "IT")
    private String departmentName;

    @Schema(description = "Department ID")
    private UUID departmentId;

    @Schema(description = "Assigned role names", example = "[\"USER\", \"RESOURCE_MANAGER\"]")
    private Set<String> roles;

    @Schema(description = "Created at")
    private LocalDateTime createdAt;

    @Schema(description = "Updated at")
    private LocalDateTime updatedAt;
}
