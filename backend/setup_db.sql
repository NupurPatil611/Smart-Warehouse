-- Run this in pgAdmin or psql as postgres superuser
-- Step 1: Create user
CREATE USER warehouse_user WITH PASSWORD 'warehouse_pass';

-- Step 2: Create database
CREATE DATABASE warehouse_db OWNER warehouse_user;

-- Step 3: Grant privileges
GRANT ALL PRIVILEGES ON DATABASE warehouse_db TO warehouse_user;

-- That's it! FastAPI will auto-create all tables on first run.
