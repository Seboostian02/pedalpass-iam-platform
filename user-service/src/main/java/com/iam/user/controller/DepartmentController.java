package com.iam.user.controller;

import com.iam.common.dto.ApiResponse;
import com.iam.user.dto.DepartmentRequest;
import com.iam.user.dto.DepartmentResponse;
import com.iam.user.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/departments")
@Tag(name = "Departments", description = "CRUD operations for departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('user:read')")
    @Operation(summary = "List all departments")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Departments retrieved")
    })
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getAllDepartments() {
        List<DepartmentResponse> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(ApiResponse.success("Departments retrieved", departments));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('user:read')")
    @Operation(summary = "Get department by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Department retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Department not found")
    })
    public ResponseEntity<ApiResponse<DepartmentResponse>> getDepartmentById(@PathVariable UUID id) {
        DepartmentResponse department = departmentService.getDepartmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Department retrieved", department));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create department", description = "Creates a new department (ADMIN only)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Department created"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Department name already exists")
    })
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        DepartmentResponse department = departmentService.createDepartment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Department created", department));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update department", description = "Updates an existing department (ADMIN only)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Department updated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Department not found")
    })
    public ResponseEntity<ApiResponse<DepartmentResponse>> updateDepartment(
            @PathVariable UUID id, @Valid @RequestBody DepartmentRequest request) {
        DepartmentResponse department = departmentService.updateDepartment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Department updated", department));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete department", description = "Deletes a department (ADMIN only)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Department deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Department not found")
    })
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable UUID id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Department deleted", null));
    }
}
