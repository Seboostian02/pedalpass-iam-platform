-- Audit Service Database Schema
-- Flyway Migration V1

CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    timestamp       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id         BIGINT,
    user_email      VARCHAR(255),
    action          VARCHAR(100) NOT NULL,
    resource_type   VARCHAR(100),
    resource_id     VARCHAR(100),
    description     TEXT,
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(512),
    severity        VARCHAR(20) DEFAULT 'INFO',
    service_name    VARCHAR(50) NOT NULL
);

CREATE TABLE security_alerts (
    id              BIGSERIAL PRIMARY KEY,
    alert_type      VARCHAR(100) NOT NULL,
    severity        VARCHAR(20) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    user_id         BIGINT,
    ip_address      VARCHAR(45),
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    acknowledged_by BIGINT,
    acknowledged_at TIMESTAMP,
    resolved_at     TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_service ON audit_logs(service_name);
CREATE INDEX idx_security_alerts_status ON security_alerts(status);
CREATE INDEX idx_security_alerts_type ON security_alerts(alert_type);
CREATE INDEX idx_security_alerts_severity ON security_alerts(severity);
