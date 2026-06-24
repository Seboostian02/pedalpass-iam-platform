package com.iam.audit.repository;

import com.iam.audit.model.AlertStatus;
import com.iam.audit.model.SecurityAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SecurityAlertRepository extends JpaRepository<SecurityAlert, UUID> {
    Page<SecurityAlert> findByStatus(AlertStatus status, Pageable pageable);
    Page<SecurityAlert> findByUserId(UUID userId, Pageable pageable);
}
