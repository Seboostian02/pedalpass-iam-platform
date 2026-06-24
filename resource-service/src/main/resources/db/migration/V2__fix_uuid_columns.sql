-- V2: Fix BIGSERIAL → UUID to match JPA entities

DROP TABLE IF EXISTS resource_check_ins CASCADE;
DROP TABLE IF EXISTS resource_schedules CASCADE;
DROP TABLE IF EXISTS access_permissions CASCADE;
DROP TABLE IF EXISTS access_requests CASCADE;
DROP TABLE IF EXISTS resources CASCADE;

CREATE TABLE resources (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    resource_type       VARCHAR(20) NOT NULL,
    resource_category   VARCHAR(20) NOT NULL,
    location            VARCHAR(255),
    capacity            INT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    requires_approval   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE access_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    user_email          VARCHAR(255) NOT NULL,
    resource_id         UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    access_level        VARCHAR(20),
    justification       TEXT,
    scheduled_start     TIMESTAMP,
    scheduled_end       TIMESTAMP,
    reviewed_by         UUID,
    review_comment      TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resources_type ON resources(resource_type);
CREATE INDEX idx_resources_category ON resources(resource_category);
CREATE INDEX idx_resources_active ON resources(is_active);
CREATE INDEX idx_access_requests_user ON access_requests(user_id);
CREATE INDEX idx_access_requests_status ON access_requests(status);
CREATE INDEX idx_access_requests_resource ON access_requests(resource_id);

-- Re-seed sample resources
INSERT INTO resources (name, description, resource_type, resource_category, location, capacity) VALUES
    ('Meeting Room A', 'Main conference room, Floor 1', 'PHYSICAL', 'MEETING_ROOM', 'Building A, Floor 1, Room 101', 10),
    ('Meeting Room B', 'Small meeting room, Floor 2', 'PHYSICAL', 'MEETING_ROOM', 'Building A, Floor 2, Room 205', 6),
    ('Parking Spot P1', 'Underground parking level 1', 'PHYSICAL', 'PARKING', 'Underground Level 1, Spot P1', 1),
    ('Parking Spot P2', 'Underground parking level 1', 'PHYSICAL', 'PARKING', 'Underground Level 1, Spot P2', 1),
    ('Office 301', 'Private office, Floor 3', 'PHYSICAL', 'OFFICE', 'Building A, Floor 3, Room 301', 2),
    ('Laptop Dell XPS #1', 'Dell XPS 15 laptop for temporary use', 'PHYSICAL', 'EQUIPMENT', 'IT Storage Room', 1),
    ('Projector Epson #1', 'Portable projector', 'PHYSICAL', 'EQUIPMENT', 'IT Storage Room', 1);

INSERT INTO resources (name, description, resource_type, resource_category) VALUES
    ('Jira Project Management', 'Atlassian Jira for project tracking', 'DIGITAL', 'APPLICATION'),
    ('Company File Share', 'Shared drive for company documents', 'DIGITAL', 'FILE_SHARE'),
    ('VPN Access', 'Corporate VPN for remote work', 'DIGITAL', 'VPN'),
    ('Production Database', 'Read-only access to production DB', 'DIGITAL', 'DATABASE');
