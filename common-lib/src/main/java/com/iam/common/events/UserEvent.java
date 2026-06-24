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
public class UserEvent implements Serializable {

    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private String action; // CREATED, UPDATED, DELETED, ENABLED, DISABLED
    private UUID performedBy;
    private String roleName;
    private String departmentId;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
