package com.iam.user.controller;

import com.iam.common.dto.ApiResponse;
import com.iam.user.dto.CreateUserRequest;
import com.iam.user.dto.UpdateUserRequest;
import com.iam.user.dto.UserResponse;
import com.iam.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "User CRUD and role assignment")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('user:read')")
    @Operation(summary = "List all active users", description = "Returns paginated list of active users")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Users retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(Pageable pageable) {
        Page<UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('user:read') or #id.toString() == authentication.principal")
    @Operation(summary = "Get user by ID", description = "Returns a single user. Users can view their own profile.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved", user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('user:write')")
    @Operation(summary = "Create user", description = "Creates a new user with optional department and role")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User created"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email already exists")
    })
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created", user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('user:write') or #id.toString() == authentication.principal")
    @Operation(summary = "Update user", description = "Updates user profile. Users can update their own profile.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User updated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID id, @Valid @RequestBody UpdateUserRequest request) {
        UserResponse updated = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate user", description = "Soft-deletes user by setting active=false (ADMIN only)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User deactivated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable UUID id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("User deactivated", null));
    }

    @PostMapping("/{id}/roles/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign role to user", description = "Assigns a role to a user (ADMIN only)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Role assigned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User or role not found")
    })
    public ResponseEntity<ApiResponse<UserResponse>> assignRole(
            @PathVariable UUID id, @PathVariable String roleName) {
        UserResponse user = userService.assignRole(id, roleName);
        return ResponseEntity.ok(ApiResponse.success("Role assigned", user));
    }

    @DeleteMapping("/{id}/roles/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove role from user", description = "Removes a role from a user (ADMIN only)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Role removed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User or role not found")
    })
    public ResponseEntity<ApiResponse<UserResponse>> removeRole(
            @PathVariable UUID id, @PathVariable String roleName) {
        UserResponse user = userService.removeRole(id, roleName);
        return ResponseEntity.ok(ApiResponse.success("Role removed", user));
    }
}
