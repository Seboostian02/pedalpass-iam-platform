package com.iam.resource.controller;

import com.iam.common.dto.ApiResponse;
import com.iam.resource.dto.*;
import com.iam.resource.model.*;
import com.iam.resource.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Resources", description = "Physical and digital resource management with access control")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // Resource endpoints

    @GetMapping("/resources/filters")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get resource filter options", description = "Retrieve available types and categories from active resources")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Filter options retrieved")
    })
    public ResponseEntity<com.iam.common.dto.ApiResponse<Map<String, Object>>> getFilterOptions(
            @RequestParam(required = false) ResourceType type) {
        List<ResourceType> types = resourceService.getDistinctTypes();
        List<ResourceCategory> categories = resourceService.getDistinctCategories(type);
        List<String> accessLevels = List.of("READ", "WRITE", "ADMIN");
        Map<String, Object> filters = Map.of(
                "types", types,
                "categories", categories,
                "accessLevels", accessLevels
        );
        return ResponseEntity.ok(com.iam.common.dto.ApiResponse.success("Filter options retrieved", filters));
    }

    @GetMapping("/resources")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all resources", description = "Retrieve paginated list of active resources")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Resources retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid JWT")
    })
    public ResponseEntity<com.iam.common.dto.ApiResponse<Page<ResourceResponse>>> getAllResources(Pageable pageable) {
        Page<Resource> resources = resourceService.getAllResources(pageable);
        Page<ResourceResponse> response = resources.map(ResourceResponse::fromEntity);
        return ResponseEntity.ok(com.iam.common.dto.ApiResponse.success("Resources retrieved successfully", response));
    }

    @GetMapping("/resources/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get resource by ID", description = "Retrieve a single resource by UUID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Resource found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Resource not found")
    })
    public ResponseEntity<com.iam.common.dto.ApiResponse<ResourceResponse>> getResource(@PathVariable UUID id) {
        Resource resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(com.iam.common.dto.ApiResponse.success("Resource retrieved", ResourceResponse.fromEntity(resource)));
    }

    @GetMapping("/resources/type/{type}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get resources by type", description = "Filter resources by PHYSICAL or DIGITAL")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Resources retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<com.iam.common.dto.ApiResponse<Page<ResourceResponse>>> getResourcesByType(
            @PathVariable ResourceType type, Pageable pageable) {
        Page<ResourceResponse> response = resourceService.getResourcesByType(type, pageable)
                .map(ResourceResponse::fromEntity);
        return ResponseEntity.ok(com.iam.common.dto.ApiResponse.success("Resources retrieved", response));
    }

    @GetMapping("/resources/category/{category}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get resources by category", description = "Filter by OFFICE, MEETING_ROOM, PARKING, EQUIPMENT, APPLICATION, FILE_SHARE, VPN, DATABASE")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Resources retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<com.iam.common.dto.ApiResponse<Page<ResourceResponse>>> getResourcesByCategory(
            @PathVariable ResourceCategory category, Pageable pageable) {
        Page<ResourceResponse> response = resourceService.getResourcesByCategory(category, pageable)
                .map(ResourceResponse::fromEntity);
        return ResponseEntity.ok(com.iam.common.dto.ApiResponse.success("Resources retrieved", response));
    }

    @PostMapping("/resources")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESOURCE_MANAGER')")
    @Operation(summary = "Create resource", description = "Create a new physical or digital resource")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Resource created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request body"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<com.iam.common.dto.ApiResponse<ResourceResponse>> createResource(
            @Valid @RequestBody CreateResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .description(request.getDescription())
                .resourceType(request.getResourceType())
                .resourceCategory(request.getResourceCategory())
                .location(request.getLocation())
                .capacity(request.getCapacity())
                .requiresApproval(request.getRequiresApproval() != null ? request.getRequiresApproval() : true)
                .active(true)
                .build();

        Resource created = resourceService.createResource(resource);
        return ResponseEntity.ok(com.iam.common.dto.ApiResponse.success("Resource created", ResourceResponse.fromEntity(created)));
    }

    @PutMapping("/resources/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESOURCE_MANAGER')")
    @Operation(summary = "Update resource", description = "Update resource details")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Resource updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Resource not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<com.iam.common.dto.ApiResponse<ResourceResponse>> updateResource(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateResourceRequest request) {
        Resource updatedFields = Resource.builder()
                .name(request.getName())
                .description(request.getDescription())
                .location(request.getLocation())
                .capacity(request.getCapacity())
                .requiresApproval(request.getRequiresApproval() != null ? request.getRequiresApproval() : true)
                .build();

        Resource updated = resourceService.updateResource(id, updatedFields);
        return ResponseEntity.ok(com.iam.common.dto.ApiResponse.success("Resource updated", ResourceResponse.fromEntity(updated)));
    }

    @DeleteMapping("/resources/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESOURCE_MANAGER')")
    @Operation(summary = "Deactivate resource", description = "Soft-delete resource and revoke all pending/approved requests")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Resource deactivated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Resource not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<com.iam.common.dto.ApiResponse<Void>> deactivateResource(@PathVariable UUID id) {
        resourceService.deactivateResource(id);
        return ResponseEntity.ok(com.iam.common.dto.ApiResponse.success("Resource deactivated", null));
    }

    @GetMapping("/resources/{resourceId}/access-requests")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get access requests for resource", description = "Retrieve all access requests for a specific resource")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Access requests retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Resource not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<com.iam.common.dto.ApiResponse<Page<AccessRequestResponse>>> getAccessRequestsByResource(
            @PathVariable UUID resourceId, Pageable pageable) {
        Page<AccessRequestResponse> response = resourceService.getAccessRequestsByResource(resourceId, pageable)
                .map(AccessRequestResponse::fromEntity);
        return ResponseEntity.ok(com.iam.common.dto.ApiResponse.success("Access requests retrieved", response));
    }

    // Access Request endpoints

    @GetMapping("/access-requests/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my access requests", description = "Retrieve current user's access requests")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Access requests retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<com.iam.common.dto.ApiResponse<Page<AccessRequestResponse>>> getMyAccessRequests(
            @RequestHeader("X-User-Id") UUID userId, Pageable pageable) {
        Page<AccessRequestResponse> response = resourceService.getAccessRequestsByUser(userId, pageable)
                .map(AccessRequestResponse::fromEntity);
        return ResponseEntity.ok(com.iam.common.dto.ApiResponse.success("My access requests retrieved", response));
    }

    @PostMapping("/access-requests")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create access request", description = "Request access to a resource")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Access request created"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Resource not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request body"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<com.iam.common.dto.ApiResponse<AccessRequestResponse>> createAccessRequest(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader("X-User-Email") String userEmail,
            @Valid @RequestBody CreateAccessRequestRequest request) {

        AccessRequest created = resourceService.createAccessRequest(
                userId, userEmail, request.getResourceId(),
                request.getJustification(), request.getAccessLevel(),
                request.getScheduledStart(), request.getScheduledEnd());

        return ResponseEntity.ok(com.iam.common.dto.ApiResponse.success("Access request created",
                AccessRequestResponse.fromEntity(created)));
    }

    @GetMapping("/access-requests/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get access request by ID", description = "Retrieve a single access request by UUID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Access request found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Access request not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<com.iam.common.dto.ApiResponse<AccessRequestResponse>> getAccessRequest(@PathVariable UUID id) {
        AccessRequest request = resourceService.getAccessRequestById(id);
        return ResponseEntity.ok(com.iam.common.dto.ApiResponse.success("Access request retrieved",
                AccessRequestResponse.fromEntity(request)));
    }

    @GetMapping("/access-requests/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESOURCE_MANAGER')")
    @Operation(summary = "Get pending access requests", description = "Retrieve all pending access requests")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Pending requests retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<com.iam.common.dto.ApiResponse<Page<AccessRequestResponse>>> getPendingRequests(Pageable pageable) {
        Page<AccessRequestResponse> response = resourceService.getPendingRequests(pageable)
                .map(AccessRequestResponse::fromEntity);
        return ResponseEntity.ok(com.iam.common.dto.ApiResponse.success("Pending requests retrieved", response));
    }

    @PostMapping("/access-requests/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESOURCE_MANAGER')")
    @Operation(summary = "Review access request", description = "Approve or deny access request with collision detection")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Request reviewed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Request not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request body"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<com.iam.common.dto.ApiResponse<AccessRequestResponse>> reviewRequest(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID reviewerId,
            @Valid @RequestBody ReviewAccessRequestRequest request) {

        AccessRequest reviewed = resourceService.reviewAccessRequest(id, reviewerId, request.getDecision(), request.getReviewComment());
        return ResponseEntity.ok(com.iam.common.dto.ApiResponse.success("Request reviewed",
                AccessRequestResponse.fromEntity(reviewed)));
    }

    @PostMapping("/access-requests/{id}/revoke")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESOURCE_MANAGER')")
    @Operation(summary = "Revoke access", description = "Revoke previously approved access request")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Access revoked"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Request not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Can only revoke approved requests"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<com.iam.common.dto.ApiResponse<AccessRequestResponse>> revokeAccessRequest(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID reviewerId,
            @RequestParam String comment) {

        AccessRequest revoked = resourceService.revokeAccessRequest(id, reviewerId, comment);
        return ResponseEntity.ok(com.iam.common.dto.ApiResponse.success("Access revoked",
                AccessRequestResponse.fromEntity(revoked)));
    }
}
