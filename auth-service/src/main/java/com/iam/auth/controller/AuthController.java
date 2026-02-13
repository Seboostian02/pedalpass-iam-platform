package com.iam.auth.controller;

import com.iam.auth.dto.*;
import com.iam.auth.service.AuthService;
import com.iam.common.dto.ApiResponse;
import com.iam.common.exception.BaseException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Register, login, token refresh and logout")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new account and returns JWT access token + refresh token")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User registered successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error (invalid email, weak password)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email already exists")
    })
    public ResponseEntity<ApiResponse<LoginResponse>> register(@Valid @RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates user and returns JWT access token (15min) + refresh token (7 days)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials or account locked")
    })
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        LoginResponse response = authService.login(request, ipAddress);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Exchanges a valid refresh token for new access + refresh tokens (rotation)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        LoginResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Blacklists the JWT in Redis and revokes all refresh tokens for the user")
    @SecurityRequirement(name = "Bearer Token")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logged out successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or missing token")
    })
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.<Void>success("Logged out successfully", null));
    }

    @PostMapping("/admin/create-user")
    @Operation(summary = "Admin create user", description = "Creates a new user with auto-generated password sent via email. Requires ADMIN role.")
    @SecurityRequirement(name = "Bearer Token")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User created, temporary password sent via email"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized (ADMIN role required)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email already exists")
    })
    public ResponseEntity<ApiResponse<Void>> adminCreateUser(
            @Valid @RequestBody AdminCreateUserRequest request,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Roles") String roles) {
        if (!roles.contains("ADMIN")) {
            throw new BaseException("Admin role required", HttpStatus.FORBIDDEN);
        }
        authService.adminCreateUser(request, UUID.fromString(userId));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<Void>success("User created successfully. Temporary password sent via email.", null));
    }
}
