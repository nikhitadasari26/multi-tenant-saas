-- 003_create_projects.sql
-- Purpose: Create projects table with tenant isolation

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'archived', 'completed')),

    created_by UUID NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_projects_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_projects_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
