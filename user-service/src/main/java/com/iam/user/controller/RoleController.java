package com.iam.user.controller;

import com.iam.common.dto.ApiResponse;
import com.iam.user.dto.RoleResponse;
import com.iam.user.model.Permission;
import com.iam.user.model.Role;
import com.iam.user.repository.PermissionRepository;
import com.iam.user.repository.RoleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/roles")
@Tag(name = "Roles & Permissions", description = "List roles and permissions")
public class RoleController {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public RoleController(RoleRepository roleRepository, PermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('role:manage')")
    @Operation(summary = "List all roles", description = "Returns all system roles with their permissions")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Roles retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
        List<RoleResponse> roles = roleRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved", roles));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('role:manage')")
    @Operation(summary = "Get role by ID", description = "Returns a single role with its permissions")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Role retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Role not found")
    })
    public ResponseEntity<ApiResponse<RoleResponse>> getRoleById(@PathVariable UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new com.iam.common.exception.ResourceNotFoundException("Role", "id", id.toString()));
        return ResponseEntity.ok(ApiResponse.success("Role retrieved", toResponse(role)));
    }

    @GetMapping("/permissions")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('role:manage')")
    @Operation(summary = "List all permissions", description = "Returns all available permissions")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Permissions retrieved")
    })
    public ResponseEntity<ApiResponse<List<Permission>>> getAllPermissions() {
        List<Permission> permissions = permissionRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Permissions retrieved", permissions));
    }

    private RoleResponse toResponse(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .systemRole(role.isSystemRole())
                .permissions(role.getPermissions().stream()
                        .map(Permission::getName)
                        .collect(Collectors.toSet()))
                .build();
    }
}
