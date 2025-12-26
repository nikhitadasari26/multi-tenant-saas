#!/bin/sh

echo " Waiting for database..."

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  sleep 2
done

echo "Database is ready"

echo " Running migrations..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/migrations/001_create_tenants.sql
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/migrations/002_create_users.sql
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/migrations/003_create_projects.sql
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/migrations/004_create_tasks.sql
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/migrations/005_create_audit_logs.sql

echo " Running seed data..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/seeds/006_seed_demo_data.sql

echo "Starting backend server..."
npm run start