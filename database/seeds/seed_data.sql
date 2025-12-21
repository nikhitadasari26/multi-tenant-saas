-- seed_data.sql
-- Purpose: Insert initial data for testing and evaluation

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- SUPER ADMIN (NO TENANT)
-- =========================
INSERT INTO users (
    id, tenant_id, email, password_hash, full_name, role
) VALUES (
    gen_random_uuid(),
    NULL,
    'superadmin@system.com',
    '$2b$10$5X8k6E9YyFQZpFzJH9JX0uZC7y8GJQ1kzvC1zE9e5xZJ5e6cXz',
    'System Admin',
    'super_admin'
);

-- =========================
-- DEMO TENANT
-- =========================
INSERT INTO tenants (
    id, name, subdomain, subscription_plan, max_users, max_projects
) VALUES (
    gen_random_uuid(),
    'Demo Company',
    'demo',
    'pro',
    25,
    15
);

-- =========================
-- TENANT ADMIN
-- =========================
INSERT INTO users (
    id, tenant_id, email, password_hash, full_name, role
)
SELECT
    gen_random_uuid(),
    t.id,
    'admin@demo.com',
    '$2b$10$KZ2dXyZ8H7C9xJ4m5QxFz5Zk3yL8M0PZ9D8EJH2zYpXk4mC',
    'Demo Admin',
    'tenant_admin'
FROM tenants t WHERE t.subdomain = 'demo';

-- =========================
-- REGULAR USERS
-- =========================
INSERT INTO users (
    id, tenant_id, email, password_hash, full_name, role
)
SELECT
    gen_random_uuid(),
    t.id,
    'user1@demo.com',
    '$2b$10$abcde12345abcde12345abcde12345abcde12345abcde',
    'Demo User One',
    'user'
FROM tenants t WHERE t.subdomain = 'demo';

INSERT INTO users (
    id, tenant_id, email, password_hash, full_name, role
)
SELECT
    gen_random_uuid(),
    t.id,
    'user2@demo.com',
    '$2b$10$abcde12345abcde12345abcde12345abcde12345abcde',
    'Demo User Two',
    'user'
FROM tenants t WHERE t.subdomain = 'demo';

-- =========================
-- SAMPLE PROJECT
-- =========================
INSERT INTO projects (
    id, tenant_id, name, description, created_by
)
SELECT
    gen_random_uuid(),
    t.id,
    'Project Alpha',
    'Demo project for evaluation',
    u.id
FROM tenants t
JOIN users u ON u.role = 'tenant_admin'
WHERE t.subdomain = 'demo';

-- =========================
-- SAMPLE TASK
-- =========================
INSERT INTO tasks (
    id, project_id, tenant_id, title, status, priority
)
SELECT
    gen_random_uuid(),
    p.id,
    p.tenant_id,
    'Initial Setup Task',
    'todo',
    'high'
FROM projects p;
