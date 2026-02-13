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
public class AuditEvent implements Serializable {

    private UUID eventId;
    private UUID userId;
    private String userEmail;
    private String action;
    private String resourceType;
    private String resourceId;
    private String description;
    private String ipAddress;
    private String userAgent;
    private String severity; // INFO, WARNING, CRITICAL
    private String serviceName;
    private Map<String, Object> metadata;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
