package com.iam.audit.controller;

import com.iam.audit.dto.*;
import com.iam.audit.model.AlertStatus;
import com.iam.audit.model.SecurityAlert;
import com.iam.audit.model.SeverityLevel;
import com.iam.audit.service.AuditService;
import com.iam.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit")
@Tag(name = "Audit Logs", description = "Audit log queries and security alert management")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping("/filters")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SECURITY_OFFICER') or hasAuthority('audit:read')")
    @Operation(summary = "Get audit filter options", description = "Retrieve available severity levels and alert statuses")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Filter options retrieved")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFilterOptions() {
        List<String> severityLevels = Arrays.stream(SeverityLevel.values()).map(Enum::name).toList();
        List<String> alertStatuses = Arrays.stream(AlertStatus.values()).map(Enum::name).toList();
        Map<String, Object> filters = Map.of(
                "severityLevels", severityLevels,
                "alertStatuses", alertStatuses
        );
        return ResponseEntity.ok(ApiResponse.success("Filter options retrieved", filters));
    }

    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SECURITY_OFFICER') or hasAuthority('audit:read')")
    @Operation(summary = "Get all audit logs", description = "Paginated list of all audit log entries")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logs retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied")
    })
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getLogs(Pageable pageable) {
        Page<AuditLogResponse> page = auditService.getAllLogs(pageable).map(AuditLogResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", page));
    }

    @GetMapping("/logs/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SECURITY_OFFICER') or hasAuthority('audit:read')")
    @Operation(summary = "Get logs by user", description = "Audit logs filtered by user ID")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getLogsByUser(
            @Parameter(description = "User ID") @PathVariable UUID userId,
            Pageable pageable) {
        Page<AuditLogResponse> page = auditService.getLogsByUserId(userId, pageable).map(AuditLogResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success("User logs retrieved", page));
    }

    @GetMapping("/logs/action/{action}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SECURITY_OFFICER')")
    @Operation(summary = "Get logs by action", description = "Audit logs filtered by action type")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getLogsByAction(
            @Parameter(description = "Action type", example = "LOGIN_FAILED") @PathVariable String action,
            Pageable pageable) {
        Page<AuditLogResponse> page = auditService.getLogsByAction(action, pageable).map(AuditLogResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success("Action logs retrieved", page));
    }

    @GetMapping("/logs/severity/{severity}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SECURITY_OFFICER')")
    @Operation(summary = "Get logs by severity", description = "Audit logs filtered by severity level")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getLogsBySeverity(
            @Parameter(description = "Severity level") @PathVariable SeverityLevel severity,
            Pageable pageable) {
        Page<AuditLogResponse> page = auditService.getLogsBySeverity(severity, pageable).map(AuditLogResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success("Severity logs retrieved", page));
    }

    @GetMapping("/logs/range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SECURITY_OFFICER') or hasAuthority('audit:export')")
    @Operation(summary = "Get logs by date range", description = "Audit logs within a time window")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getLogsByDateRange(
            @Parameter(description = "Start date-time (ISO)") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @Parameter(description = "End date-time (ISO)") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            Pageable pageable) {
        Page<AuditLogResponse> page = auditService.getLogsByDateRange(start, end, pageable).map(AuditLogResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success("Logs in range", page));
    }

    @GetMapping("/alerts")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SECURITY_OFFICER')")
    @Operation(summary = "Get all alerts", description = "Paginated list of all security alerts")
    public ResponseEntity<ApiResponse<Page<SecurityAlertResponse>>> getAlerts(Pageable pageable) {
        Page<SecurityAlertResponse> page = auditService.getAlerts(pageable).map(SecurityAlertResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success("Alerts retrieved", page));
    }

    @GetMapping("/alerts/open")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SECURITY_OFFICER')")
    @Operation(summary = "Get open alerts", description = "Only alerts with OPEN status")
    public ResponseEntity<ApiResponse<Page<SecurityAlertResponse>>> getOpenAlerts(Pageable pageable) {
        Page<SecurityAlertResponse> page = auditService.getOpenAlerts(pageable).map(SecurityAlertResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success("Open alerts", page));
    }

    @PostMapping("/alerts/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SECURITY_OFFICER')")
    @Operation(summary = "Resolve an alert", description = "Mark a security alert as resolved")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Alert resolved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Alert not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Alert already resolved/dismissed")
    })
    public ResponseEntity<ApiResponse<SecurityAlertResponse>> resolveAlert(
            @Parameter(description = "Alert ID") @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody(required = false) ResolveAlertRequest request) {
        String comment = request != null ? request.getComment() : null;
        SecurityAlert alert = auditService.resolveAlert(id, UUID.fromString(userId), comment);
        return ResponseEntity.ok(ApiResponse.success("Alert resolved", SecurityAlertResponse.fromEntity(alert)));
    }

    @PostMapping("/alerts/{id}/dismiss")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SECURITY_OFFICER')")
    @Operation(summary = "Dismiss an alert", description = "Mark a security alert as dismissed (not a real threat)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Alert dismissed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Alert not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Alert already resolved/dismissed")
    })
    public ResponseEntity<ApiResponse<SecurityAlertResponse>> dismissAlert(
            @Parameter(description = "Alert ID") @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody(required = false) DismissAlertRequest request) {
        String reason = request != null ? request.getReason() : null;
        SecurityAlert alert = auditService.dismissAlert(id, UUID.fromString(userId), reason);
        return ResponseEntity.ok(ApiResponse.success("Alert dismissed", SecurityAlertResponse.fromEntity(alert)));
    }
}
