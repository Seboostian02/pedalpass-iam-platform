package com.iam.notification.controller;

import com.iam.common.dto.ApiResponse;
import com.iam.notification.dto.NotificationPreferenceResponse;
import com.iam.notification.dto.NotificationResponse;
import com.iam.notification.dto.UpdatePreferenceRequest;
import com.iam.notification.model.NotificationPreference;
import com.iam.notification.model.NotificationType;
import com.iam.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "User notifications and preference management")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my notifications", description = "Paginated list of notifications for the current user")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getMyNotifications(
            @RequestHeader("X-User-Id") String userId,
            Pageable pageable) {
        Page<NotificationResponse> page = notificationService.getUserNotifications(
                UUID.fromString(userId), pageable).map(NotificationResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", page));
    }

    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread notifications", description = "Paginated list of unread notifications")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getUnreadNotifications(
            @RequestHeader("X-User-Id") String userId,
            Pageable pageable) {
        Page<NotificationResponse> page = notificationService.getUnreadNotifications(
                UUID.fromString(userId), pageable).map(NotificationResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success("Unread notifications", page));
    }

    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread count", description = "Number of unread notifications")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @RequestHeader("X-User-Id") String userId) {
        long count = notificationService.getUnreadCount(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success("Unread count", Map.of("count", count)));
    }

    @PostMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark as read", description = "Mark a single notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @Parameter(description = "Notification ID") @PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Marked as read", null));
    }

    @PostMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all as read", description = "Mark all notifications as read for the current user")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@RequestHeader("X-User-Id") String userId) {
        notificationService.markAllAsRead(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.<Void>success("All marked as read", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete notification", description = "Delete a notification by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notification deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @Parameter(description = "Notification ID") @PathVariable UUID id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Notification deleted", null));
    }

    @GetMapping("/types")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get notification types", description = "Retrieve available notification types")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Types retrieved")
    })
    public ResponseEntity<ApiResponse<List<String>>> getNotificationTypes() {
        List<String> types = Arrays.stream(NotificationType.values()).map(Enum::name).toList();
        return ResponseEntity.ok(ApiResponse.success("Notification types retrieved", types));
    }

    @GetMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get preferences", description = "Get notification preferences for the current user")
    public ResponseEntity<ApiResponse<List<NotificationPreferenceResponse>>> getPreferences(
            @RequestHeader("X-User-Id") String userId) {
        List<NotificationPreferenceResponse> prefs = notificationService.getPreferences(UUID.fromString(userId))
                .stream().map(NotificationPreferenceResponse::fromEntity).toList();
        return ResponseEntity.ok(ApiResponse.success("Preferences retrieved", prefs));
    }

    @PutMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update preference", description = "Create or update a notification preference for a specific type")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Preference updated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error")
    })
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> updatePreference(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody UpdatePreferenceRequest request) {
        NotificationPreference pref = notificationService.updatePreference(UUID.fromString(userId), request);
        return ResponseEntity.ok(ApiResponse.success("Preference updated", NotificationPreferenceResponse.fromEntity(pref)));
    }
}
