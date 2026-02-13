package com.iam.resource.dto;

import com.iam.resource.model.RequestStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Review access request")
public class ReviewAccessRequestRequest {

    @NotNull(message = "Decision is required")
    @Schema(description = "Decision", example = "APPROVED")
    private RequestStatus decision;

    @Schema(description = "Review comment", example = "Approved for project work")
    private String reviewComment;
}
