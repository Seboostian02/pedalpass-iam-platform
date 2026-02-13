package com.iam.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Create user request")
public class CreateUserRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Schema(description = "User email address", example = "john.doe@company.com")
    private String email;

    @NotBlank(message = "First name is required")
    @Schema(description = "User first name", example = "John")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Schema(description = "User last name", example = "Doe")
    private String lastName;

    @Schema(description = "Phone number", example = "+40712345678")
    private String phoneNumber;

    @Schema(description = "Department ID (UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
    private String departmentId;

    @Schema(description = "Role name to assign", example = "USER")
    private String roleName;
}
