-- Purpose: Create tenants table for multi-tenant SaaS

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  subdomain VARCHAR UNIQUE NOT NULL,
  status VARCHAR DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'trial')),
  subscription_plan VARCHAR DEFAULT 'free'
    CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
  max_users INT DEFAULT 5,
  max_projects INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tenants_subdomain
ON tenants(subdomain);
