-- File: 1__core_db.sql
-- Description: Initializes the core database schema and tables.

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    social_number VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.Tenants Table
CREATE TABLE IF NOT EXISTS clients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    social_number VARCHAR(255) UNIQUE,
    tenant VARCHAR(255) UNIQUE NOT NULL,
    db_connection VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Client-Users Associative Table
CREATE TABLE IF NOT EXISTS client_users (
    fk_user_id BIGINT NOT NULL,
    fk_client_id BIGINT NOT NULL,
    CONSTRAINT fk_client_users_user FOREIGN KEY (fk_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_client_users_client FOREIGN KEY (fk_client_id) REFERENCES clients(id) ON DELETE CASCADE,
    PRIMARY KEY (fk_user_id, fk_client_id)
);

-- Indexes for optmize Multi-Tenant search
CREATE INDEX IF NOT EXISTS idx_clients_tenant ON clients(tenant);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);