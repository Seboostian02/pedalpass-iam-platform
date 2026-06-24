package com.iam.audit.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Resolve security alert request")
public class ResolveAlertRequest {

    @Schema(description = "Resolution comment", example = "False positive - user on VPN")
    private String comment;
}
