# Research Document – Multi-Tenant SaaS Platform

## 1. Multi-Tenancy Analysis

Multi-tenancy is an architectural approach where a single application instance serves multiple organizations (tenants), while ensuring that each tenant’s data is isolated and secure. In SaaS platforms, choosing the correct multi-tenancy strategy is very important because it directly affects scalability, security, performance, and cost.

There are three common multi-tenancy approaches used in real-world systems.

---

### 1.1 Shared Database + Shared Schema (Tenant ID Based)

In this approach, all tenants share the same database and the same tables. Each table contains a `tenant_id` column, which is used to identify which records belong to which tenant.

**How it works:**
- One database
- One schema
- One set of tables
- Each row is linked to a tenant using `tenant_id`

**Advantages:**
- Very cost-effective (only one database to manage)
- Easy to scale for a large number of tenants
- Easier database maintenance and migrations
- Efficient use of system resources
- Faster onboarding of new tenants

**Disadvantages:**
- Strong tenant isolation must be enforced in application logic
- A bug in filtering logic can cause data leakage
- More responsibility on developers to ensure security

---

### 1.2 Shared Database + Separate Schema (Schema Per Tenant)

In this approach, all tenants share the same database, but each tenant has its own database schema.

**How it works:**
- One database
- Multiple schemas (one per tenant)
- Each tenant has its own set of tables

**Advantages:**
- Better data isolation than shared schema
- Less risk of accidental data access
- Still cheaper than separate databases

**Disadvantages:**
- Schema management becomes complex as tenants increase
- Migrations must run for every tenant schema
- Harder to scale when tenants grow large

---

### 1.3 Separate Database Per Tenant

In this approach, each tenant has its own completely separate database.

**How it works:**
- Multiple databases
- One database per tenant

**Advantages:**
- Strongest data isolation
- High security and compliance
- Easy to backup or restore individual tenants

**Disadvantages:**
- Very expensive
- Difficult to manage at scale
- Complex deployment and maintenance
- Not suitable for small or medium SaaS platforms

---

### 1.4 Comparison Table

| Approach | Cost | Scalability | Isolation | Complexity |
|-------|------|-----------|-----------|-----------|
| Shared DB + Shared Schema | Low | High | Medium | Low |
| Shared DB + Separate Schema | Medium | Medium | High | Medium |
| Separate Database Per Tenant | High | Low | Very High | High |

---

### 1.5 Chosen Approach & Justification

For this project, **Shared Database + Shared Schema with tenant_id isolation** is chosen.

**Reasons:**
- Matches real-world SaaS products like Slack, Notion, Jira (logical isolation)
- Cost-effective and scalable
- Easier to deploy using Docker
- Suitable for academic evaluation and automated testing
- Required by project constraints (single database service)

Tenant isolation is enforced strictly using:
- `tenant_id` filtering in every query
- JWT-based tenant identification
- Middleware-level enforcement
- Role-based authorization checks

---

## 2. Technology Stack Justification

Choosing the right technology stack is important for building a secure, scalable, and maintainable SaaS platform.

---

### 2.1 Backend – Node.js + Express.js

**Why chosen:**
- Lightweight and fast
- Huge ecosystem
- Easy to build REST APIs
- Large community support
- Works well with PostgreSQL and Docker

**Alternatives considered:**
- Django (Python)
- Spring Boot (Java)

**Why not chosen:**
- Django is heavier for simple APIs
- Spring Boot is more complex and time-consuming for this scope

---

### 2.2 Frontend – React.js

**Why chosen:**
- Component-based architecture
- Easy state management
- Fast development
- Excellent ecosystem
- Industry standard

**Alternatives considered:**
- Angular
- Vue.js

**Why not chosen:**
- Angular has steeper learning curve
- Vue is less commonly used in enterprise projects

---

### 2.3 Database – PostgreSQL

**Why chosen:**
- Strong relational integrity
- ACID compliance
- Supports complex queries
- ENUM types and constraints
- Excellent Docker support

**Alternatives considered:**
- MySQL
- MongoDB

**Why not chosen:**
- MongoDB is not ideal for relational data
- PostgreSQL provides better consistency guarantees

---

### 2.4 Authentication – JWT (JSON Web Tokens)

**Why chosen:**
- Stateless authentication
- Scales easily
- No session storage required
- Ideal for REST APIs
- Easy role & tenant embedding

**Alternatives considered:**
- Session-based authentication
- OAuth only

---

### 2.5 Docker & Docker Compose

**Why chosen:**
- Consistent environment
- One-command deployment
- Required by evaluation
- Easy service orchestration
- Simplifies dependency management

---

## 3. Security Considerations

Security is critical in a multi-tenant system because a single vulnerability can expose data across tenants.

---

### 3.1 Data Isolation Strategy

- Every table includes `tenant_id`
- JWT contains tenantId
- Queries always filter by tenant_id
- Client-provided tenant_id is never trusted
- Super admin is handled as a special case

---

### 3.2 Authentication & Authorization

- JWT tokens with 24-hour expiry
- Roles embedded in token
- RBAC enforced at API level
- Unauthorized access returns 403

---

### 3.3 Password Security

- Passwords are never stored in plain text
- Bcrypt hashing with salt
- Secure comparison using bcrypt.compare

---

### 3.4 API Security Measures

- Input validation on all endpoints
- Proper HTTP status codes
- Consistent error responses
- Audit logging for all critical actions

---

### 3.5 Audit Logging

- All CREATE, UPDATE, DELETE actions logged
- Includes user_id, tenant_id, action, entity
- Helps in security audits and debugging

---

## Conclusion

This research defines a clear, secure, and scalable approach for building a production-ready multi-tenant SaaS application. The chosen architecture, technology stack, and security practices align with industry standards and meet all project requirements.
