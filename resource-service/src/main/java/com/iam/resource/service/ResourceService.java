package com.iam.resource.service;

import com.iam.common.config.RabbitMQConstants;
import com.iam.common.events.AccessDecisionEvent;
import com.iam.common.events.AccessRequestEvent;
import com.iam.common.events.ResourceCollisionEvent;
import com.iam.common.exception.ResourceNotFoundException;
import com.iam.resource.model.*;
import com.iam.resource.repository.AccessRequestRepository;
import com.iam.resource.repository.ResourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ResourceService {

    private static final Logger log = LoggerFactory.getLogger(ResourceService.class);

    private final ResourceRepository resourceRepository;
    private final AccessRequestRepository accessRequestRepository;
    private final RabbitTemplate rabbitTemplate;

    public ResourceService(ResourceRepository resourceRepository,
                           AccessRequestRepository accessRequestRepository,
                           RabbitTemplate rabbitTemplate) {
        this.resourceRepository = resourceRepository;
        this.accessRequestRepository = accessRequestRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    // Resource CRUD operations

    public Page<Resource> getAllResources(Pageable pageable) {
        return resourceRepository.findByActiveTrue(pageable);
    }

    public Resource getResourceById(UUID id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id.toString()));
    }

    public Page<Resource> getResourcesByType(ResourceType type, Pageable pageable) {
        return resourceRepository.findByResourceTypeAndActiveTrue(type, pageable);
    }

    public Page<Resource> getResourcesByCategory(ResourceCategory category, Pageable pageable) {
        return resourceRepository.findByResourceCategoryAndActiveTrue(category, pageable);
    }

    @Transactional
    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    @Transactional
    public Resource updateResource(UUID id, Resource updatedResource) {
        Resource resource = getResourceById(id);
        resource.setName(updatedResource.getName());
        resource.setDescription(updatedResource.getDescription());
        resource.setLocation(updatedResource.getLocation());
        resource.setCapacity(updatedResource.getCapacity());
        resource.setRequiresApproval(updatedResource.isRequiresApproval());
        return resourceRepository.save(resource);
    }

    @Transactional
    public void deactivateResource(UUID id) {
        Resource resource = getResourceById(id);
        resource.setActive(false);
        resourceRepository.save(resource);

        // Revoke all pending/approved requests for this resource
        List<AccessRequest> activeRequests = accessRequestRepository.findByResourceIdAndStatusIn(
                id, List.of(RequestStatus.PENDING, RequestStatus.APPROVED));

        for (AccessRequest req : activeRequests) {
            req.setStatus(RequestStatus.REVOKED);
            req.setReviewComment("Resource deactivated");
        }
        accessRequestRepository.saveAll(activeRequests);

        log.info("Resource {} deactivated, {} requests revoked", resource.getName(), activeRequests.size());
    }

    // Access Request operations

    @Transactional
    public AccessRequest createAccessRequest(UUID userId, String userEmail, UUID resourceId,
                                              String justification, String accessLevel,
                                              LocalDateTime start, LocalDateTime end) {
        Resource resource = getResourceById(resourceId);

        AccessRequest request = AccessRequest.builder()
                .userId(userId)
                .userEmail(userEmail)
                .resource(resource)
                .justification(justification)
                .accessLevel(accessLevel)
                .scheduledStart(start)
                .scheduledEnd(end)
                .build();

        request = accessRequestRepository.save(request);

        // Publish access request event
        AccessRequestEvent event = AccessRequestEvent.builder()
                .eventId(UUID.randomUUID())
                .requestId(request.getId())
                .userId(userId)
                .userEmail(userEmail)
                .resourceId(resourceId)
                .resourceName(resource.getName())
                .resourceType(resource.getResourceType().name())
                .accessLevel(accessLevel)
                .justification(justification)
                .scheduledStart(start)
                .scheduledEnd(end)
                .timestamp(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConstants.EVENTS_EXCHANGE,
                RabbitMQConstants.RESOURCE_ACCESS_REQUESTED,
                event);

        log.info("Access request created for resource {} by user {}", resource.getName(), userEmail);
        return request;
    }

    @Transactional
    public AccessRequest reviewAccessRequest(UUID requestId, UUID reviewerId, RequestStatus decision, String comment) {
        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("AccessRequest", "id", requestId.toString()));

        // Collision detection for APPROVED physical resources
        if (decision == RequestStatus.APPROVED && request.getResource().getResourceType() == ResourceType.PHYSICAL) {
            List<AccessRequest> overlapping = accessRequestRepository.findOverlapping(
                    request.getResource().getId(), request.getScheduledStart(), request.getScheduledEnd());

            if (!overlapping.isEmpty()) {
                request.setStatus(RequestStatus.COLLISION);
                request.setReviewedBy(reviewerId);
                request.setReviewComment("Collision detected with existing reservation");
                accessRequestRepository.save(request);

                // Publish collision event with both new and existing request info
                AccessRequest existingRequest = overlapping.get(0);
                publishCollisionEvent(request, existingRequest);

                return request;
            }
        }

        request.setStatus(decision);
        request.setReviewedBy(reviewerId);
        request.setReviewComment(comment);
        accessRequestRepository.save(request);

        // Publish decision event (APPROVED or DENIED)
        String decisionStr = switch (decision) {
            case APPROVED -> "APPROVED";
            case DENIED -> "DENIED";
            default -> null;
        };
        if (decisionStr != null) {
            publishAccessDecisionEvent(request, decisionStr);
        }

        return request;
    }

    @Transactional
    public AccessRequest revokeAccessRequest(UUID requestId, UUID reviewerId, String comment) {
        AccessRequest request = getAccessRequestById(requestId);

        if (request.getStatus() != RequestStatus.APPROVED) {
            throw new IllegalStateException("Can only revoke approved requests");
        }

        request.setStatus(RequestStatus.REVOKED);
        request.setReviewedBy(reviewerId);
        request.setReviewComment(comment);
        accessRequestRepository.save(request);

        // Publish revoke event
        publishAccessDecisionEvent(request, "REVOKED");

        log.info("Access request {} revoked by {}", requestId, reviewerId);
        return request;
    }

    public AccessRequest getAccessRequestById(UUID id) {
        return accessRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AccessRequest", "id", id.toString()));
    }

    public Page<AccessRequest> getAccessRequestsByUser(UUID userId, Pageable pageable) {
        return accessRequestRepository.findByUserId(userId, pageable);
    }

    public Page<AccessRequest> getAccessRequestsByResource(UUID resourceId, Pageable pageable) {
        return accessRequestRepository.findByResourceId(resourceId, pageable);
    }

    public Page<AccessRequest> getAccessRequestsByStatus(RequestStatus status, Pageable pageable) {
        return accessRequestRepository.findByStatus(status, pageable);
    }

    public Page<AccessRequest> getPendingRequests(Pageable pageable) {
        return accessRequestRepository.findByStatus(RequestStatus.PENDING, pageable);
    }

    // Private helper methods for RabbitMQ event publishing

    private void publishAccessDecisionEvent(AccessRequest request, String decision) {
        AccessDecisionEvent event = AccessDecisionEvent.builder()
                .requestId(request.getId())
                .userId(request.getUserId())
                .userEmail(request.getUserEmail())
                .resourceId(request.getResource().getId())
                .resourceName(request.getResource().getName())
                .decision(decision)
                .reviewedBy(request.getReviewedBy())
                .reviewComment(request.getReviewComment())
                .timestamp(LocalDateTime.now())
                .build();

        String routingKey = switch (decision) {
            case "APPROVED" -> RabbitMQConstants.RESOURCE_ACCESS_APPROVED;
            case "DENIED" -> RabbitMQConstants.RESOURCE_ACCESS_DENIED;
            case "REVOKED" -> RabbitMQConstants.RESOURCE_ACCESS_REVOKED;
            default -> throw new IllegalArgumentException("Unknown decision: " + decision);
        };

        rabbitTemplate.convertAndSend(RabbitMQConstants.EVENTS_EXCHANGE, routingKey, event);
        log.info("Published {} event for request {}", decision, request.getId());
    }

    private void publishCollisionEvent(AccessRequest newRequest, AccessRequest existingRequest) {
        ResourceCollisionEvent event = ResourceCollisionEvent.builder()
                .resourceId(newRequest.getResource().getId())
                .resourceName(newRequest.getResource().getName())
                .requestingUserId(newRequest.getUserId())
                .requestingUserEmail(newRequest.getUserEmail())
                .existingRequestId(existingRequest.getId())
                .existingUserId(existingRequest.getUserId())
                .requestedFrom(newRequest.getScheduledStart())
                .requestedUntil(newRequest.getScheduledEnd())
                .existingFrom(existingRequest.getScheduledStart())
                .existingUntil(existingRequest.getScheduledEnd())
                .timestamp(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConstants.EVENTS_EXCHANGE,
                RabbitMQConstants.RESOURCE_COLLISION_DETECTED,
                event);

        log.warn("Collision detected - new request {} conflicts with existing request {}",
                newRequest.getId(), existingRequest.getId());
    }
}
