package com.iam.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccessRequestEvent implements Serializable {

    private UUID eventId;
    private UUID requestId;
    private UUID userId;
    private String userEmail;
    private UUID resourceId;
    private String resourceName;
    private String resourceType;
    private String accessLevel;
    private String justification;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
