#!/bin/bash

# Check DB connection
echo "Waiting for database connection..."
python -m app.backend_pre_start

# Run migrations
echo "Running migrations..."
alembic upgrade head

# Create initial data
echo "Creating initial data..."
python -m app.initial_data

# Start the application
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
