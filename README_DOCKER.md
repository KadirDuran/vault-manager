# Docker Deployment Guide

## Prerequisites
- Docker and Docker Compose installed.
- Docker Hub account.

## 1. Build and Push Images
Run the PowerShell script in the `deploy` folder:

```powershell
cd deploy
./push_to_hub.ps1
```

Enter your Docker Hub username when prompted. This will build and push:
- `<username>/vault-backend:latest`
- `<username>/vault-frontend:latest`

## 2. Run on Another Machine
Copy `docker-compose.prod.yml` to the target machine (rename it to `docker-compose.yml` if you like).

Set the `DOCKER_USERNAME` environment variable and run:

```bash
export DOCKER_USERNAME=your_username
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables
The production setup uses the following defaults (can be overridden in `.env` or environment):
- `POSTGRES_USER`: `vaultmgr`
- `POSTGRES_PASSWORD`: `changeme`
- `SECRET_KEY`: `changeme`
