-- Initialize multiple databases for IAM Platform microservices
-- This script runs automatically on first PostgreSQL container startup
-- Runs as POSTGRES_USER (defined in .env.example as DB_USER)

CREATE DATABASE iam_auth;
CREATE DATABASE iam_users;
CREATE DATABASE iam_resources;
CREATE DATABASE iam_audit;
CREATE DATABASE iam_notifications;
