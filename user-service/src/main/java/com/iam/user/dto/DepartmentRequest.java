package com.iam.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Department create/update request")
public class DepartmentRequest {

    @NotBlank(message = "Department name is required")
    @Schema(description = "Department name", example = "IT")
    private String name;

    @Schema(description = "Department description", example = "Information Technology Department")
    private String description;
}
