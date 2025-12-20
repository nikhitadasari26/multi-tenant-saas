# System Architecture Document
## Multi-Tenant SaaS Platform – Project & Task Management System

---

## 1. System Architecture Overview

The Multi-Tenant SaaS Platform follows a standard three-tier architecture consisting of a frontend client, backend API server, and a database. The system is fully containerized using Docker and orchestrated with Docker Compose.

### Architecture Components

1. **Client (Browser)**
   - Users access the application through a web browser.
   - Communicates only with the frontend application.

2. **Frontend Application**
   - Built using React.js.
   - Handles user interface, routing, and role-based UI rendering.
   - Communicates with the backend API over HTTP using JWT authentication.
   - Runs on port 3000 inside a Docker container.

3. **Backend API Server**
   - Built using Node.js and Express.js.
   - Exposes RESTful APIs for authentication, tenant management, users, projects, and tasks.
   - Implements business logic, validation, authorization, and audit logging.
   - Runs on port 5000 inside a Docker container.

4. **Database (PostgreSQL)**
   - Stores all application data.
   - Uses a shared database and shared schema with tenant_id based isolation.
   - Runs on port 5432 inside a Docker container.

---

### Authentication & Authorization Flow

1. User logs in using email, password, and tenant subdomain.
2. Backend verifies credentials and generates a JWT token.
3. JWT token contains userId, tenantId, and role.
4. Token is sent with every request in Authorization header.
5. Backend middleware validates token and enforces RBAC.
6. Tenant isolation is enforced by filtering queries using tenant_id.

---

## 2. Database Schema Design

The database follows a relational schema with strong constraints to ensure data integrity and tenant isolation.

### Core Tables

#### Tenants
- Stores organization-level data.
- Each tenant has a unique subdomain.
- Subscription plan and limits are stored here.

#### Users
- Stores all users including super admins.
- tenant_id is NULL for super_admin users.
- Email is unique per tenant using a composite unique constraint.

#### Projects
- Each project belongs to a tenant.
- Created by a user within the same tenant.

#### Tasks
- Each task belongs to a project and a tenant.
- Tasks can be assigned to users of the same tenant.

#### Audit Logs
- Records all important actions like create, update, and delete.
- Used for security auditing and traceability.

### Tenant Isolation Strategy

- Every table (except super admin users) includes tenant_id.
- Backend never trusts tenant_id from client input.
- Tenant ID is extracted from JWT or derived from related entities.
- Super admin bypasses tenant filtering where allowed.

---

## 3. API Architecture

The backend exposes a total of **19 REST APIs**, grouped into modules.

---

### Authentication APIs
| Method | Endpoint | Auth | Role |
|------|--------|------|------|
| POST | /api/auth/register-tenant | No | Public |
| POST | /api/auth/login | No | Public |
| GET | /api/auth/me | Yes | All |
| POST | /api/auth/logout | Yes | All |

---

### Tenant Management APIs
| Method | Endpoint | Auth | Role |
|------|--------|------|------|
| GET | /api/tenants/:tenantId | Yes | Tenant Admin / Super Admin |
| PUT | /api/tenants/:tenantId | Yes | Tenant Admin / Super Admin |
| GET | /api/tenants | Yes | Super Admin |

---

### User Management APIs
| Method | Endpoint | Auth | Role |
|------|--------|------|------|
| POST | /api/tenants/:tenantId/users | Yes | Tenant Admin |
| GET | /api/tenants/:tenantId/users | Yes | Tenant Users |
| PUT | /api/users/:userId | Yes | Tenant Admin / Self |
| DELETE | /api/users/:userId | Yes | Tenant Admin |

---

### Project Management APIs
| Method | Endpoint | Auth | Role |
|------|--------|------|------|
| POST | /api/projects | Yes | Tenant Users |
| GET | /api/projects | Yes | Tenant Users |
| PUT | /api/projects/:projectId | Yes | Tenant Admin / Creator |
| DELETE | /api/projects/:projectId | Yes | Tenant Admin / Creator |

---

### Task Management APIs
| Method | Endpoint | Auth | Role |
|------|--------|------|------|
| POST | /api/projects/:projectId/tasks | Yes | Tenant Users |
| GET | /api/projects/:projectId/tasks | Yes | Tenant Users |
| PATCH | /api/tasks/:taskId/status | Yes | Tenant Users |
| PUT | /api/tasks/:taskId | Yes | Tenant Users |

---

## Conclusion

This architecture ensures scalability, security, and strict tenant isolation while remaining simple to deploy using Docker. The design follows industry best practices and meets all project requirements.
