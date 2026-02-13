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
public class ResourceCollisionEvent implements Serializable {

    private UUID resourceId;
    private String resourceName;
    private UUID requestingUserId;
    private String requestingUserEmail;
    private UUID existingRequestId;
    private UUID existingUserId;
    private LocalDateTime requestedFrom;
    private LocalDateTime requestedUntil;
    private LocalDateTime existingFrom;
    private LocalDateTime existingUntil;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
