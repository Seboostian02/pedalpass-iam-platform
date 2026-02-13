-- V2: Fix BIGSERIAL → UUID to match JPA entities

DROP TABLE IF EXISTS security_alerts CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID UNIQUE,
    user_id         UUID,
    user_email      VARCHAR(255),
    action          VARCHAR(100) NOT NULL,
    resource_type   VARCHAR(100),
    resource_id     VARCHAR(100),
    severity        VARCHAR(20) NOT NULL DEFAULT 'INFO',
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(512),
    details         TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE security_alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type      VARCHAR(100) NOT NULL,
    severity        VARCHAR(20) NOT NULL DEFAULT 'WARNING',
    status          VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    user_id         UUID,
    user_email      VARCHAR(255),
    description     TEXT,
    resolved_by     UUID,
    resolved_at     TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_security_alerts_status ON security_alerts(status);
CREATE INDEX idx_security_alerts_type ON security_alerts(alert_type);
CREATE INDEX idx_security_alerts_severity ON security_alerts(severity);
