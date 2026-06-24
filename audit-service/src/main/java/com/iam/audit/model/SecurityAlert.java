package com.iam.audit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "security_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "alert_type", nullable = false)
    private String alertType;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SeverityLevel severity = SeverityLevel.WARNING;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AlertStatus status = AlertStatus.OPEN;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "user_email")
    private String userEmail;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "resolved_by")
    private UUID resolvedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
