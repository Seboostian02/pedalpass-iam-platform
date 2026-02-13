package com.iam.user.service;

import com.iam.common.exception.ResourceConflictException;
import com.iam.common.exception.ResourceNotFoundException;
import com.iam.user.dto.CreateUserRequest;
import com.iam.user.dto.UpdateUserRequest;
import com.iam.user.dto.UserResponse;
import com.iam.user.model.Department;
import com.iam.user.model.Role;
import com.iam.user.model.User;
import com.iam.user.repository.DepartmentRepository;
import com.iam.user.repository.RoleRepository;
import com.iam.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       DepartmentRepository departmentRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
    }

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAllActive(pageable).map(this::toResponse);
    }

    public UserResponse getUserById(UUID id) {
        return toResponse(findById(id));
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return toResponse(user);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceConflictException("User with email " + request.getEmail() + " already exists");
        }

        User user = User.builder()
                .id(UUID.randomUUID())
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .build();

        if (request.getDepartmentId() != null && !request.getDepartmentId().isBlank()) {
            Department dept = departmentRepository.findById(UUID.fromString(request.getDepartmentId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
            user.setDepartment(dept);
        }

        if (request.getRoleName() != null && !request.getRoleName().isBlank()) {
            Role role = roleRepository.findByName(request.getRoleName())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "name", request.getRoleName()));
            user.getRoles().add(role);
        } else {
            roleRepository.findByName("USER").ifPresent(role -> user.getRoles().add(role));
        }

        User saved = userRepository.save(user);
        log.info("User created: {}", saved.getEmail());
        return toResponse(saved);
    }

    @Transactional
    public UserResponse createUserFromEvent(UUID userId, String email, String firstName, String lastName,
                                            String roleName, String departmentId) {
        if (userRepository.existsByEmail(email)) {
            log.warn("User {} already exists in user-service, skipping", email);
            return toResponse(userRepository.findByEmail(email).orElseThrow());
        }

        User user = User.builder()
                .id(userId)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .build();

        if (roleName != null && !roleName.isBlank()) {
            roleRepository.findByName(roleName).ifPresentOrElse(
                    role -> user.getRoles().add(role),
                    () -> {
                        log.warn("Role '{}' not found, falling back to USER", roleName);
                        roleRepository.findByName("USER").ifPresent(r -> user.getRoles().add(r));
                    });
        } else {
            roleRepository.findByName("USER").ifPresent(role -> user.getRoles().add(role));
        }

        if (departmentId != null && !departmentId.isBlank()) {
            departmentRepository.findById(UUID.fromString(departmentId)).ifPresentOrElse(
                    user::setDepartment,
                    () -> log.warn("Department '{}' not found, skipping", departmentId));
        }

        User saved = userRepository.save(user);
        log.info("User synced from auth-service: {} (role={}, dept={})", saved.getEmail(), roleName, departmentId);
        return toResponse(saved);
    }

    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = findById(id);

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());

        if (request.getDepartmentId() != null) {
            if (request.getDepartmentId().isBlank()) {
                user.setDepartment(null);
            } else {
                Department dept = departmentRepository.findById(UUID.fromString(request.getDepartmentId()))
                        .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
                user.setDepartment(dept);
            }
        }

        User saved = userRepository.save(user);
        log.info("User updated: {}", saved.getEmail());
        return toResponse(saved);
    }

    @Transactional
    public void deactivateUser(UUID id) {
        User user = findById(id);
        user.setActive(false);
        userRepository.save(user);
        log.info("User deactivated: {}", user.getEmail());
    }

    @Transactional
    public UserResponse assignRole(UUID userId, String roleName) {
        User user = findById(userId);
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));
        user.getRoles().add(role);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse removeRole(UUID userId, String roleName) {
        User user = findById(userId);
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));
        user.getRoles().remove(role);
        return toResponse(userRepository.save(user));
    }

    private User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id.toString()));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .active(user.isActive())
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
