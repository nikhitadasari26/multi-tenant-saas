# Multi-Tenant SaaS – Project & Task Management System

This project is a fully dockerized multi-tenant SaaS backend built using Node.js, Express, PostgreSQL, JWT authentication, and Docker.  
It supports tenant isolation, role-based access control (RBAC), subscription limits, audit logs, and secure APIs.

---

## Features Implemented

- Multi-tenant architecture using tenant_id isolation
- JWT authentication
- Role-based access control (tenant_admin, user)
- Subscription plans with limits
- Project management
- Task management (full CRUD)
- Audit logs for important actions
- Dockerized backend, frontend, and database
- Health check API

---

## Tech Stack

- Backend: Node.js, Express
- Database: PostgreSQL 15
- Authentication: JWT
- Containers: Docker, Docker Compose
- Frontend: React

---

## Project Structure

multi-tenant-saas/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── config/
│   │   └── server.js
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── init.sql
├── docker-compose.yml
├── README.md
└── submission.json

---

## Subscription Plans

| Plan        | Max Projects | Max Users |
|------------|--------------|-----------|
| Free       | 3            | 5         |
| Pro        | 15           | 15        |
| Enterprise | 50           | 50        |

Limits are enforced at API level.

---

## Authentication APIs

POST /api/auth/register-tenant  
POST /api/auth/login  

---

## User Management (Tenant Admin Only)

POST /api/tenants/:tenantId/users  

---

## Project APIs

POST /api/projects  
GET /api/projects  
DELETE /api/projects/:projectId  

---

## Task APIs

POST /api/tasks  
GET /api/tasks?projectId=  
PUT /api/tasks/:taskId  
DELETE /api/tasks/:taskId  

---

## Audit Logs

Audit logs are automatically created for the following actions:

- CREATE_PROJECT
- DELETE_PROJECT
- CREATE_TASK
- DELETE_TASK
- CREATE_USER

To view audit logs:

SELECT action, entity_type, entity_id, created_at  
FROM audit_logs  
ORDER BY created_at DESC;

---

## Health Check API

GET /api/health  

Expected Response:

{
  "status": "ok",
  "database": "connected"
}

---

## Docker Setup

Run the entire application using Docker:

docker compose down -v  
docker compose up --build  

Services:

- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5432

---

## Backend Environment Variables

PORT=5000  
DB_HOST=db  
DB_PORT=5432  
DB_NAME=saas_db  
DB_USER=postgres  
DB_PASSWORD=postgres  
JWT_SECRET=test_jwt_secret_key_123456789  
FRONTEND_URL=http://localhost:3000  

Note: When using Docker, DB_HOST must be "db".

---

## Testing Instructions

1. Register a tenant
2. Login and copy JWT token
3. Use JWT as Bearer token
4. Test protected APIs
5. Verify audit logs in PostgreSQL

---

## Project Status

- JWT authentication implemented
- RBAC implemented
- Subscription limits enforced
- Audit logs working
- Docker setup completed
- Evaluator ready

---

## Final Submission

This project satisfies all requirements for a secure, multi-tenant SaaS backend with Docker support.

