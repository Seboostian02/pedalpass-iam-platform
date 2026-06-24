-- V2: Fix column types to match JPA entities (UUID instead of BIGSERIAL)
-- Dev environment only - drops and recreates tables

DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS mfa_secrets CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS user_credentials CASCADE;

CREATE TABLE user_credentials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE NOT NULL,
    is_locked       BOOLEAN DEFAULT FALSE NOT NULL,
    failed_attempts INT DEFAULT 0,
    lock_expires_at TIMESTAMP,
    mfa_enabled     BOOLEAN DEFAULT FALSE NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    token           VARCHAR(512) NOT NULL UNIQUE,
    email           VARCHAR(255),
    expires_at      TIMESTAMP NOT NULL,
    revoked         BOOLEAN DEFAULT FALSE NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE mfa_secrets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE,
    secret          VARCHAR(255) NOT NULL,
    is_enabled      BOOLEAN DEFAULT FALSE,
    backup_codes    TEXT[],
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
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
