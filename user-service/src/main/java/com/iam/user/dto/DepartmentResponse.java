package com.iam.user.dto;

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
@Schema(description = "Department response")
public class DepartmentResponse {

    @Schema(description = "Department ID")
    private UUID id;

    @Schema(description = "Department name", example = "IT")
    private String name;

    @Schema(description = "Department description", example = "Information Technology Department")
    private String description;

    @Schema(description = "Created at")
    private LocalDateTime createdAt;
}
