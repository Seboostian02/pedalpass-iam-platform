package com.iam.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Update user request")
public class UpdateUserRequest {

    @Schema(description = "User first name", example = "John")
    private String firstName;

    @Schema(description = "User last name", example = "Doe")
    private String lastName;

    @Schema(description = "Phone number", example = "+40712345678")
    private String phoneNumber;

    @Schema(description = "Department ID (UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
    private String departmentId;
}
