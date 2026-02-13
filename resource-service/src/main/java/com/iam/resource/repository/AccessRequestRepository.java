package com.iam.resource.repository;

import com.iam.resource.model.AccessRequest;
import com.iam.resource.model.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AccessRequestRepository extends JpaRepository<AccessRequest, UUID> {
    Page<AccessRequest> findByUserId(UUID userId, Pageable pageable);
    Page<AccessRequest> findByStatus(RequestStatus status, Pageable pageable);
    Page<AccessRequest> findByResourceId(UUID resourceId, Pageable pageable);
    List<AccessRequest> findByResourceIdAndStatusIn(UUID resourceId, List<RequestStatus> statuses);

    @Query("SELECT ar FROM AccessRequest ar WHERE ar.resource.id = :resourceId " +
            "AND ar.status = 'APPROVED' " +
            "AND ar.scheduledStart < :end " +
            "AND ar.scheduledEnd > :start")
    List<AccessRequest> findOverlapping(UUID resourceId, LocalDateTime start, LocalDateTime end);
}
