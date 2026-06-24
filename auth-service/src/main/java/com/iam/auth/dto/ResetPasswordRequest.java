package com.iam.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request to reset password using a valid token")
public class ResetPasswordRequest {

    @NotBlank(message = "Token is required")
    @Schema(description = "The password reset token from the email link")
    private String token;

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$",
            message = "Password must contain uppercase, lowercase, digit and special character (@$!%*?&)")
    @Schema(description = "The new password", example = "NewPass123!")
    private String newPassword;
}
