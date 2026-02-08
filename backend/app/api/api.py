from fastapi import APIRouter
from app.api.v1 import auth, users, vaults, secrets, policies, tokens, approles, monitor

api_router = APIRouter()
api_router.include_router(auth.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(vaults.router, prefix="/vaults", tags=["vaults"])
api_router.include_router(secrets.router, prefix="/secrets", tags=["secrets"])
api_router.include_router(policies.router, prefix="/policies", tags=["policies"])
api_router.include_router(tokens.router, prefix="/tokens", tags=["tokens"])
api_router.include_router(approles.router, prefix="/approles", tags=["approles"])
api_router.include_router(monitor.router, prefix="/monitor", tags=["monitor"])
