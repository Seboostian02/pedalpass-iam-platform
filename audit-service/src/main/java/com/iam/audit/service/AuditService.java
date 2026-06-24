package com.iam.audit.service;

import com.iam.audit.model.AuditLog;
import com.iam.audit.model.SecurityAlert;
import com.iam.audit.model.AlertStatus;
import com.iam.audit.model.SeverityLevel;
import com.iam.audit.repository.AuditLogRepository;
import com.iam.audit.repository.SecurityAlertRepository;
import com.iam.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final SecurityAlertRepository securityAlertRepository;

    public AuditService(AuditLogRepository auditLogRepository,
                        SecurityAlertRepository securityAlertRepository) {
        this.auditLogRepository = auditLogRepository;
        this.securityAlertRepository = securityAlertRepository;
    }

    public Page<AuditLog> getAllLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    public Page<AuditLog> getLogsByUserId(UUID userId, Pageable pageable) {
        return auditLogRepository.findByUserId(userId, pageable);
    }

    public Page<AuditLog> getLogsByAction(String action, Pageable pageable) {
        return auditLogRepository.findByAction(action, pageable);
    }

    public Page<AuditLog> getLogsBySeverity(SeverityLevel severity, Pageable pageable) {
        return auditLogRepository.findBySeverity(severity, pageable);
    }

    public Page<AuditLog> getLogsByDateRange(LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return auditLogRepository.findByCreatedAtBetween(start, end, pageable);
    }

    public Page<SecurityAlert> getAlerts(Pageable pageable) {
        return securityAlertRepository.findAll(pageable);
    }

    public Page<SecurityAlert> getOpenAlerts(Pageable pageable) {
        return securityAlertRepository.findByStatus(AlertStatus.OPEN, pageable);
    }

    @Transactional
    public SecurityAlert resolveAlert(UUID alertId, UUID resolvedBy, String comment) {
        SecurityAlert alert = securityAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("SecurityAlert", "id", alertId.toString()));
        if (alert.getStatus() != AlertStatus.OPEN) {
            throw new IllegalStateException("Alert is already " + alert.getStatus());
        }
        alert.setStatus(AlertStatus.RESOLVED);
        alert.setResolvedBy(resolvedBy);
        alert.setResolvedAt(LocalDateTime.now());
        if (comment != null && !comment.isBlank()) {
            alert.setDescription(alert.getDescription() + " | Resolution: " + comment);
        }
        return securityAlertRepository.save(alert);
    }

    @Transactional
    public SecurityAlert dismissAlert(UUID alertId, UUID dismissedBy, String reason) {
        SecurityAlert alert = securityAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("SecurityAlert", "id", alertId.toString()));
        if (alert.getStatus() != AlertStatus.OPEN) {
            throw new IllegalStateException("Alert is already " + alert.getStatus());
        }
        alert.setStatus(AlertStatus.DISMISSED);
        alert.setResolvedBy(dismissedBy);
        alert.setResolvedAt(LocalDateTime.now());
        if (reason != null && !reason.isBlank()) {
            alert.setDescription(alert.getDescription() + " | Dismissed: " + reason);
        }
        return securityAlertRepository.save(alert);
    }
}
