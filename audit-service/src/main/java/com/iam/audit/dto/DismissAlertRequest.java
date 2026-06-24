package com.iam.audit.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dismiss security alert request")
public class DismissAlertRequest {

    @Schema(description = "Dismiss reason", example = "Not a real threat")
    private String reason;
}
