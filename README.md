# Vault Manager

A comprehensive management interface for multiple HashiCorp Vault instances.

## Features
- **Multi-Vault Management**: Manage multiple Vault environments (Prod, Stage, Dev) from a single dashboard.
- **Unseal/Seal Operations**: Securely unseal vaults with shared key parts.
- **Secret Management**: Browse, create, update, and delete secrets with a powerful UI.
- **Policy Editor**: Visual policy editor with checkbox-based capability management.
- **AppRole Management**: Manage AppRoles, SecretIDs, and RoleIDs.
- **Audit Logging**: Track all user actions.

## Tech Stack
- **Backend**: Python (FastAPI), SQLAlchemy, PostgreSQL
- **Frontend**: React, TypeScript, Material-UI
- **Infrastructure**: Docker, Docker Compose

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Quick Start
1. Clone the repository
2. Start the stack:
   ```bash
   docker-compose up -d --build
   ```
3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/docs

## Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Security
- Unseal keys are encrypted at rest using Fernet encryption.
- JWT tokens are used for authentication.
- All sensitive operations are logged.

## License
MIT
