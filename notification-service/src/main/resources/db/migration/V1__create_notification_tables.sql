-- Notification Service Database Schema
-- Flyway Migration V1

CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    body            TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    action_url      VARCHAR(512),
    email_sent      BOOLEAN DEFAULT FALSE,
    email_sent_at   TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at         TIMESTAMP
);

CREATE TABLE notification_preferences (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,
    email_enabled   BOOLEAN DEFAULT TRUE,
    in_app_enabled  BOOLEAN DEFAULT TRUE,
    security_alerts BOOLEAN DEFAULT TRUE,
    access_updates  BOOLEAN DEFAULT TRUE,
    system_updates  BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
