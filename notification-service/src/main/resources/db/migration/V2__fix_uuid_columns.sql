-- V2: Fix BIGSERIAL → UUID to match JPA entities

DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    user_email          VARCHAR(255) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    message             TEXT NOT NULL,
    notification_type   VARCHAR(50) NOT NULL,
    is_read             BOOLEAN NOT NULL DEFAULT FALSE,
    is_email_sent       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at             TIMESTAMP
);

CREATE TABLE notification_preferences (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    notification_type   VARCHAR(50) NOT NULL,
    email_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_enabled      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notif_prefs_user ON notification_preferences(user_id);
