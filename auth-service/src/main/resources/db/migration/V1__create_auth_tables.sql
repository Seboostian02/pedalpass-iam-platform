-- Auth Service Database Schema
-- Flyway Migration V1

CREATE TABLE user_credentials (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    is_enabled      BOOLEAN DEFAULT TRUE,
    is_locked       BOOLEAN DEFAULT FALSE,
    failed_attempts INT DEFAULT 0,
    lock_time       TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    token           VARCHAR(512) NOT NULL UNIQUE,
    expires_at      TIMESTAMP NOT NULL,
    is_revoked      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_info     VARCHAR(512),
    ip_address      VARCHAR(45)
);

CREATE TABLE mfa_secrets (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,
    secret          VARCHAR(255) NOT NULL,
    is_enabled      BOOLEAN DEFAULT FALSE,
    backup_codes    TEXT[],
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    token           VARCHAR(255) NOT NULL UNIQUE,
    expires_at      TIMESTAMP NOT NULL,
    is_used         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_credentials_email ON user_credentials(email);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
