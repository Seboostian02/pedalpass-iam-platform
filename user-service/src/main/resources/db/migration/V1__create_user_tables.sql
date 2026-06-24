-- User Service Database Schema
-- Flyway Migration V1

CREATE TABLE departments (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    parent_id       BIGINT REFERENCES departments(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    avatar_url      VARCHAR(512),
    department_id   BIGINT REFERENCES departments(id),
    employee_id     VARCHAR(50) UNIQUE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    description     TEXT,
    is_system_role  BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    category        VARCHAR(50)
);

CREATE TABLE role_permissions (
    role_id         BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id         BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_id         BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by     BIGINT,
    PRIMARY KEY (user_id, role_id)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- Seed system roles
INSERT INTO roles (name, description, is_system_role) VALUES
    ('ADMIN', 'Full system administrator', TRUE),
    ('USER', 'Standard employee', TRUE),
    ('GUEST', 'Temporary/limited access', TRUE),
    ('SECURITY_OFFICER', 'Security audit and monitoring', TRUE),
    ('RESOURCE_MANAGER', 'Manages physical/digital resources', TRUE);

-- Seed permissions
INSERT INTO permissions (name, description, category) VALUES
    ('user:read', 'View user profiles', 'USER'),
    ('user:write', 'Create/update users', 'USER'),
    ('user:delete', 'Delete users', 'USER'),
    ('role:manage', 'Manage roles and permissions', 'USER'),
    ('resource:read', 'View resources', 'RESOURCE'),
    ('resource:write', 'Create/update resources', 'RESOURCE'),
    ('resource:delete', 'Delete resources', 'RESOURCE'),
    ('resource:request', 'Request access to resources', 'RESOURCE'),
    ('resource:approve', 'Approve/deny access requests', 'RESOURCE'),
    ('audit:read', 'View audit logs', 'AUDIT'),
    ('audit:export', 'Export audit reports', 'AUDIT'),
    ('system:config', 'Modify system configuration', 'SYSTEM');

-- Assign permissions to roles
-- ADMIN gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ADMIN';

-- USER gets basic permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'USER' AND p.name IN ('user:read', 'resource:read', 'resource:request');

-- GUEST gets minimal permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'GUEST' AND p.name IN ('resource:read');

-- SECURITY_OFFICER gets audit permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'SECURITY_OFFICER' AND p.name IN ('audit:read', 'audit:export', 'resource:read', 'user:read');

-- RESOURCE_MANAGER gets resource permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'RESOURCE_MANAGER' AND p.name IN ('resource:read', 'resource:write', 'resource:delete', 'resource:approve');

-- Seed default departments
INSERT INTO departments (name, description) VALUES
    ('IT', 'Information Technology Department'),
    ('HR', 'Human Resources Department'),
    ('Security', 'Physical and Cyber Security Department'),
    ('Management', 'Executive Management'),
    ('Operations', 'Operations Department');
