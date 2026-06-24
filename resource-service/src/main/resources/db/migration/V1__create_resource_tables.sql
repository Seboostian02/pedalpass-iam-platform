-- Resource Service Database Schema
-- Flyway Migration V1

CREATE TABLE resources (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    resource_type       VARCHAR(20) NOT NULL,
    category            VARCHAR(20) NOT NULL,
    location            VARCHAR(255),
    capacity            INT,
    url                 VARCHAR(512),
    is_available        BOOLEAN DEFAULT TRUE,
    requires_approval   BOOLEAN DEFAULT TRUE,
    auto_expire_hours   INT DEFAULT 0,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE access_permissions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    resource_id     BIGINT REFERENCES resources(id) ON DELETE CASCADE,
    access_level    VARCHAR(20) NOT NULL DEFAULT 'READ',
    granted_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMP,
    granted_by      BIGINT NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE access_requests (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    resource_id     BIGINT REFERENCES resources(id),
    requested_level VARCHAR(20) NOT NULL DEFAULT 'READ',
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    justification   TEXT NOT NULL,
    requested_from  TIMESTAMP,
    requested_until TIMESTAMP,
    reviewed_by     BIGINT,
    reviewed_at     TIMESTAMP,
    review_comment  TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resource_schedules (
    id                  BIGSERIAL PRIMARY KEY,
    resource_id         BIGINT REFERENCES resources(id) ON DELETE CASCADE,
    user_id             BIGINT NOT NULL,
    start_time          TIMESTAMP NOT NULL,
    end_time            TIMESTAMP NOT NULL,
    status              VARCHAR(20) DEFAULT 'RESERVED',
    access_request_id   BIGINT REFERENCES access_requests(id),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resource_check_ins (
    id              BIGSERIAL PRIMARY KEY,
    resource_id     BIGINT REFERENCES resources(id),
    user_id         BIGINT NOT NULL,
    schedule_id     BIGINT REFERENCES resource_schedules(id),
    checked_in_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checked_out_at  TIMESTAMP
);

-- Indexes
CREATE INDEX idx_resources_type ON resources(resource_type);
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_available ON resources(is_available);
CREATE INDEX idx_access_permissions_user ON access_permissions(user_id);
CREATE INDEX idx_access_permissions_resource ON access_permissions(resource_id);
CREATE INDEX idx_access_requests_user ON access_requests(user_id);
CREATE INDEX idx_access_requests_status ON access_requests(status);
CREATE INDEX idx_access_requests_resource ON access_requests(resource_id);
CREATE INDEX idx_resource_schedules_resource ON resource_schedules(resource_id);
CREATE INDEX idx_resource_schedules_time ON resource_schedules(start_time, end_time);
CREATE INDEX idx_resource_check_ins_resource ON resource_check_ins(resource_id);

-- Seed sample resources
INSERT INTO resources (name, description, resource_type, category, location, capacity) VALUES
    ('Meeting Room A', 'Main conference room, Floor 1', 'PHYSICAL', 'MEETING_ROOM', 'Building A, Floor 1, Room 101', 10),
    ('Meeting Room B', 'Small meeting room, Floor 2', 'PHYSICAL', 'MEETING_ROOM', 'Building A, Floor 2, Room 205', 6),
    ('Parking Spot P1', 'Underground parking level 1', 'PHYSICAL', 'PARKING', 'Underground Level 1, Spot P1', 1),
    ('Parking Spot P2', 'Underground parking level 1', 'PHYSICAL', 'PARKING', 'Underground Level 1, Spot P2', 1),
    ('Office 301', 'Private office, Floor 3', 'PHYSICAL', 'OFFICE', 'Building A, Floor 3, Room 301', 2),
    ('Laptop Dell XPS #1', 'Dell XPS 15 laptop for temporary use', 'PHYSICAL', 'EQUIPMENT', 'IT Storage Room', 1),
    ('Projector Epson #1', 'Portable projector', 'PHYSICAL', 'EQUIPMENT', 'IT Storage Room', 1);

INSERT INTO resources (name, description, resource_type, category, url) VALUES
    ('Jira Project Management', 'Atlassian Jira for project tracking', 'DIGITAL', 'APPLICATION', 'https://company.atlassian.net'),
    ('Company File Share', 'Shared drive for company documents', 'DIGITAL', 'FILE_SHARE', 'smb://fileserver/shared'),
    ('VPN Access', 'Corporate VPN for remote work', 'DIGITAL', 'VPN', 'vpn://vpn.company.local'),
    ('Production Database', 'Read-only access to production DB', 'DIGITAL', 'DATABASE', 'jdbc:postgresql://prod-db:5432/main');
