package com.iam.user.service;

import com.iam.common.exception.ResourceConflictException;
import com.iam.common.exception.ResourceNotFoundException;
import com.iam.user.dto.DepartmentRequest;
import com.iam.user.dto.DepartmentResponse;
import com.iam.user.model.Department;
import com.iam.user.repository.DepartmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private static final Logger log = LoggerFactory.getLogger(DepartmentService.class);

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public DepartmentResponse getDepartmentById(UUID id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id.toString()));
        return toResponse(dept);
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new ResourceConflictException("Department '" + request.getName() + "' already exists");
        }
        Department dept = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        Department saved = departmentRepository.save(dept);
        log.info("Department created: {}", saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public DepartmentResponse updateDepartment(UUID id, DepartmentRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id.toString()));
        dept.setName(request.getName());
        dept.setDescription(request.getDescription());
        Department saved = departmentRepository.save(dept);
        log.info("Department updated: {}", saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public void deleteDepartment(UUID id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id.toString()));
        departmentRepository.delete(dept);
        log.info("Department deleted: {}", dept.getName());
    }

    private DepartmentResponse toResponse(Department dept) {
        return DepartmentResponse.builder()
                .id(dept.getId())
                .name(dept.getName())
                .description(dept.getDescription())
                .createdAt(dept.getCreatedAt())
                .build();
    }
}
