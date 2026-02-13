package com.iam.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Token refresh request")
public class TokenRefreshRequest {

    @NotBlank(message = "Refresh token is required")
    @Schema(description = "Opaque refresh token received from login/register", example = "550e8400-e29b-41d4-a716-446655440000")
    private String refreshToken;
}
