CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- DEMO TENANT
INSERT INTO tenants (
  id,
  name,
  subdomain,
  status,
  subscription_plan,
  max_users,
  max_projects
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Demo Company',
  'demo',
  'active',
  'pro',
  10,
  20
)
ON CONFLICT (subdomain) DO NOTHING;

-- DEMO ADMIN USER
INSERT INTO users (
  id,
  tenant_id,
  email,
  password_hash,
  full_name,
  role,
  is_active
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'admin@demo.com',
  '$2b$10$N9qo8uLOickgx2ZMRZo4i.ej5H0u1s4Gm2v5ZC7O9CkZzG5H1QYfK',
  'Demo Admin',
  'tenant_admin',
  true
)
ON CONFLICT (email, tenant_id) DO NOTHING;