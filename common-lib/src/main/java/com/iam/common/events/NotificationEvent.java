package com.iam.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent implements Serializable {

    private UUID userId;
    private String type; // ACCESS_REQUEST, ACCESS_APPROVED, ACCESS_DENIED, SECURITY_ALERT, SYSTEM, RESOURCE_COLLISION
    private String title;
    private String body;
    private String channel; // IN_APP, EMAIL, BOTH
    private String actionUrl;
    private Map<String, Object> metadata;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
