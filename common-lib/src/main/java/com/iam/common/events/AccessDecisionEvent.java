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
public class AccessDecisionEvent implements Serializable {

    private UUID requestId;
    private UUID userId;
    private String userEmail;
    private UUID resourceId;
    private String resourceName;
    private String decision; // APPROVED, DENIED, REVOKED
    private UUID reviewedBy;
    private String reviewComment;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
