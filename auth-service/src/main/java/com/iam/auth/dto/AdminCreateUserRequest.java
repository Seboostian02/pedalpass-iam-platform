package com.iam.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Admin create user request (password auto-generated and sent via email)")
public class AdminCreateUserRequest {

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

    @Schema(description = "Role to assign (optional)", example = "USER")
    private String roleName;

    @Schema(description = "Department ID to assign (optional)")
    private String departmentId;
}
