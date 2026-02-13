package com.iam.resource.repository;

import com.iam.resource.model.Resource;
import com.iam.resource.model.ResourceCategory;
import com.iam.resource.model.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {
    Page<Resource> findByResourceType(ResourceType type, Pageable pageable);
    Page<Resource> findByResourceCategory(ResourceCategory category, Pageable pageable);
    Page<Resource> findByActiveTrue(Pageable pageable);
    Page<Resource> findByResourceTypeAndActiveTrue(ResourceType type, Pageable pageable);
    Page<Resource> findByResourceCategoryAndActiveTrue(ResourceCategory category, Pageable pageable);
}
